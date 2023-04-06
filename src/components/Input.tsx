import { classNames } from "../utils";

type InputValue = string | number;

interface CommonProps
  extends Omit<React.HTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  label: string;
  disabled?: boolean;
}

interface NumberInputProps extends CommonProps {
  type: "number";
  value?: number;
  onChange?: (newValue: number) => void;
}

interface TextInputProps extends CommonProps {
  type?: "text";
  value?: string;
  onChange?: (newValue: string) => void;
}

export type InputProps = NumberInputProps | TextInputProps;

function Input({
  label,
  type = "text",
  disabled = false,
  value = "",
  onChange = (newValue: string) => {},
  ...rest
}: InputProps) {
  return (
    <label className="block">
      <p className="mb-0.5 text-sm font-semibold">{label}</p>
      <input
        type={type}
        className={classNames(
          "rounded-md border p-1",
          disabled ? "bg-gray-100 text-gray-900" : "bg-transparent text-inherit"
        )}
        value={value}
        onChange={(e) => {
          if (e.target.value === "") {
            // @ts-ignore
            onChange("");
          } else if (type === "number") {
            // @ts-ignore
            onChange(Number(e.target.value));
          } else {
            // @ts-ignore
            onChange(e.target.value);
          }
        }}
        {...rest}
      />
    </label>
  );
}

export default Input;
