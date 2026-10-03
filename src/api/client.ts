import { User, StudentProfile, Scheme, Application, Deficiency, AuditLog, Notification, Grievance } from '../types';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('mota_auth_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('mota_auth_token', token);
    } else {
      localStorage.removeItem('mota_auth_token');
    }
  }

  public getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    return data.data;
  }

  // Auth
  public async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    return data;
  }

  public async register(payload: { name: string; email: string; password: string; mobile?: string; role?: string }) {
    const data = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(data.token);
    return data;
  }

  public async getMe(): Promise<{ user: User; profile: StudentProfile | null }> {
    return this.request('/auth/me');
  }

  public async getDemoUsers(): Promise<User[]> {
    return this.request('/auth/demo-users');
  }

  // Student
  public async getProfile(): Promise<StudentProfile | null> {
    return this.request('/student/profile');
  }

  public async updateProfile(profile: Partial<StudentProfile>): Promise<StudentProfile> {
    return this.request('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
  }

  public async getSchemes(): Promise<Scheme[]> {
    return this.request('/student/schemes');
  }

  public async getStudentApplications(): Promise<Application[]> {
    return this.request('/student/applications');
  }

  public async createApplication(schemeCode: 'NFST' | 'NOS'): Promise<Application> {
    return this.request('/student/applications', {
      method: 'POST',
      body: JSON.stringify({ schemeCode })
    });
  }

  public async getApplicationDetails(id: string): Promise<{
    application: Application;
    documents: any[];
    deficiencies: Deficiency[];
    scheme: Scheme;
  }> {
    return this.request(`/student/applications/${id}`);
  }

  public async saveApplicationDraft(id: string, responses: Record<string, any>): Promise<Application> {
    return this.request(`/student/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ responses })
    });
  }

  public async submitApplication(id: string): Promise<Application> {
    return this.request(`/student/applications/${id}/submit`, {
      method: 'POST'
    });
  }

  public async getApplicationTimeline(id: string): Promise<any> {
    return this.request(`/student/applications/${id}/timeline`);
  }

  // Documents
  public async getSampleFiles(): Promise<any[]> {
    return this.request('/documents/sample-files');
  }

  public async uploadDocument(payload: {
    applicationId: string;
    requirementKey: string;
    documentTitle: string;
    file?: File;
    sampleFileKey?: string;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('applicationId', payload.applicationId);
    formData.append('requirementKey', payload.requirementKey);
    formData.append('documentTitle', payload.documentTitle);

    if (payload.file) {
      formData.append('file', payload.file);
    }
    if (payload.sampleFileKey) {
      formData.append('sampleFileKey', payload.sampleFileKey);
    }

    return this.request('/documents/upload', {
      method: 'POST',
      body: formData
    });
  }

  // Deficiencies
  public async getDeficiencies(): Promise<Deficiency[]> {
    return this.request('/deficiencies');
  }

  public async resubmitDeficiency(id: string, studentResponse: string): Promise<any> {
    return this.request(`/deficiencies/${id}/resubmit`, {
      method: 'POST',
      body: JSON.stringify({ studentResponse, resolved: true })
    });
  }

  // Admin / Staff
  public async getAdminDashboard(): Promise<any> {
    return this.request('/admin/dashboard');
  }

  public async getVerificationQueue(params?: { scheme?: string; status?: string; priority?: string }): Promise<any[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/admin/verification-queue${query ? `?${query}` : ''}`);
  }

  public async getStaffApplicationPackage(id: string): Promise<any> {
    return this.request(`/admin/applications/${id}`);
  }

  public async reviewApplication(id: string, payload: {
    action: 'approve' | 'deficiency' | 'manual_review' | 'reject' | 'shortlist';
    reason: string;
    deficiencyTitle?: string;
    deficiencyRequirement?: string;
  }): Promise<any> {
    return this.request(`/admin/applications/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  public async getAuditLogs(): Promise<AuditLog[]> {
    return this.request('/admin/audit-logs');
  }

  public async resetDemoData(): Promise<any> {
    return this.request('/admin/demo/reset', {
      method: 'POST'
    });
  }

  // Scheme Management
  public async updateSchemeRules(code: string, rules: any[], changeSummary: string): Promise<any> {
    return this.request(`/schemes/${code}/rules`, {
      method: 'PUT',
      body: JSON.stringify({ rules, changeSummary })
    });
  }

  // Selection Committee
  public async getSelectionRanking(schemeCode: string): Promise<any> {
    return this.request(`/selection/${schemeCode}/ranking`);
  }

  public async decideSelection(applicationId: string, payload: {
    decision: 'shortlist' | 'select' | 'reject' | 'waitlist';
    reason: string;
    overrideReason?: string;
  }): Promise<any> {
    return this.request(`/selection/${applicationId}/decision`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // Grievance
  public async getGrievances(): Promise<Grievance[]> {
    return this.request('/grievances');
  }

  public async submitGrievance(subject: string, message: string, applicationId?: string): Promise<Grievance> {
    return this.request('/grievances', {
      method: 'POST',
      body: JSON.stringify({ subject, message, applicationId })
    });
  }

  public async replyGrievance(id: string, replyText: string, resolve: boolean = false): Promise<Grievance> {
    return this.request(`/grievances/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ replyText, resolve })
    });
  }

  // Notifications
  public async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    return this.request('/notifications');
  }

  public async markNotificationRead(id: string): Promise<any> {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  public async markAllNotificationsRead(): Promise<any> {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  // Assistant
  public async askAssistant(query: string, applicationId?: string): Promise<{
    answer: string;
    source: string;
    groundedInScheme: boolean;
    modelUsed: string;
  }> {
    return this.request('/assistant/ask', {
      method: 'POST',
      body: JSON.stringify({ query, applicationId })
    });
  }
}

export const api = new ApiClient();
