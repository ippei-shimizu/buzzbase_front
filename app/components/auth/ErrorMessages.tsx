import { DangerIcon } from "@app/components/icon/DangerIcon";

export default function ErrorMessages({ errors }: ErrorMessagesProps) {
  return (
    <>
      {errors?.length > 0 ? (
        <ul className="w-10/12 max-w-xs fixed top-10 right-4 bg-danger-300 p-4 rounded-xl flex flex-col justify-center gap-y-1.5 z-50 md:right-10 lg:right-20">
          {errors.map((error, index) => (
            <li key={index} className="text-xs flex items-center gap-x-2">
              <DangerIcon
                fill="#fff"
                filled="#fff"
                height="16"
                width="16"
                label=""
              />
              {error}
            </li>
          ))}
        </ul>
      ) : (
        ""
      )}
    </>
  );
}
