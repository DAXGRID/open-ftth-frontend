interface CheckboxProps {
  checked: boolean;
  value: string | number;
  onChange: (change: { value: string | number; checked: boolean }) => void;
}

function Checkbox({ checked, value, onChange }: CheckboxProps) {
  return (
    <div className="checkbox">
      <input
        type="checkbox"
        onChange={(x) => onChange({ value: value, checked: x.target.checked })}
        checked={checked}
      />
    </div>
  );
}

export default Checkbox;
