export const Button = ({
  onClick,
  children,
  text,
}: {
  onClick: () => void;
  children: React.ReactNode;
  text: string;
}) => {
  return (
    <>
      <button onClick={onClick} className="bg-yellow-300 border-4 border-white">
        {children}
        {text}
      </button>
    </>
  );
};
