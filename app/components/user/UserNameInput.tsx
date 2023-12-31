import { UserIcon } from "@app/components/icon/UserIcon";
import { Input } from "@nextui-org/react";

export default function UserNameInput({
  value,
  onChange,
  className,
  type = "text",
  label,
  placeholder,
  labelPlacement,
  isInvalid,
  color = "default",
  errorMessage,
  variant,
  isRequired,
}: UserNameInputProps) {
  return (
    <>
      <Input
        value={value}
        onChange={onChange}
        className={className}
        type={type}
        label={label}
        placeholder={placeholder}
        labelPlacement={labelPlacement}
        isInvalid={isInvalid}
        color={isInvalid ? "danger" : color}
        errorMessage={isInvalid && errorMessage}
        variant={variant}
        isRequired={isRequired}
        startContent={
          <UserIcon
            fill="#e08e0a"
            filled="#e08e0a"
            height="1em"
            width="1em"
            label=""
          />
        }
      />
    </>
  );
}
