export const Button = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <>
      <button onClick={onClick} className="bg-yellow-300 border-4 border-white">
        {children}
      </button>
    </>
  );
};
