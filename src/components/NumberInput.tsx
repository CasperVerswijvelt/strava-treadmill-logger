import { FunctionComponent, useState } from "react";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  className?: string;
  placeHolder?: string;
}

export const NumberInput: FunctionComponent<NumberInputProps> = ({
  value,
  onChange,
  id,
  className,
  placeHolder,
}) => {
  const [inputValue, setInputValue] = useState(`${value}`);
  const [isValid, setIsValid] = useState(true);
  return (
    <input
      id={id}
      type="number"
      value={inputValue}
      placeholder={placeHolder}
      className={
        (isValid ? "" : "outline-2 outline-dashed outline-red-500") +
        " " +
        className
      }
      onChange={(e) => {
        const stringValue = e.target.value;
        setInputValue(stringValue);
        const newValue = Number(stringValue);
        const valid = !!stringValue && !isNaN(newValue);
        setIsValid(valid);
        if (valid) onChange(newValue);
      }}
    />
  );
};
