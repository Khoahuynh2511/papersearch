interface VietnamFlagProps {
  width?: number;
  height?: number;
  className?: string;
}

const VietnamFlag: React.FC<VietnamFlagProps> = ({ 
  width = 24, 
  height = 16, 
  className = "" 
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 16"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Red background */}
      <rect width="24" height="16" fill="#DA020E" />
      
      {/* Yellow star */}
      <path
        d="M12 3l1.545 3.09L17 6l-2.455 2.5L15 12l-3-1.5L9 12l.455-3.5L7 6l3.455.09L12 3z"
        fill="#FFCD00"
      />
    </svg>
  );
};

export default VietnamFlag; 