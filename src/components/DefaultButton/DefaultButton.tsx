type DefaultButtonProps = {
  onClick: () => void;
  innerText: string | undefined;
  maxWidth?: string;
  disabled?: boolean;
};

function DefaultButton({
  onClick,
  innerText,
  maxWidth,
  disabled = false,
}: DefaultButtonProps) {
  return (
    <button
      type="button"
      style={{ maxWidth }}
      className="default-button"
      disabled={disabled}
      onClick={() => onClick()}
    >
      {innerText}
    </button>
  );
}

export default DefaultButton;
