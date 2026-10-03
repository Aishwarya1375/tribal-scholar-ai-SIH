import React from 'react';

export const TricolorBar: React.FC = () => {
  return (
    <div className="w-full flex h-1.5 shadow-sm">
      <div className="w-1/3 bg-[#FF9933]" title="Saffron - Courage and Sacrifice" />
      <div className="w-1/3 bg-white" title="White - Peace and Truth" />
      <div className="w-1/3 bg-[#138808]" title="Green - Faith and Chivalry" />
    </div>
  );
};
