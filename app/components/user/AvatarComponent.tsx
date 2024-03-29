import { Avatar } from "@nextui-org/react";

type UserData = {
  userData: {
    user: {
      image: any;
      name: string;
      user_id: string;
      url: string;
    };
  };
};

export default function AvatarComponent(props: UserData) {
  const { userData } = props;
  const imageUrl =
    process.env.NODE_ENV === "production"
      ? userData.user.image.url
      : `${process.env.NEXT_PUBLIC_S3_API_URL}${userData.user.image.url}`;

  return (
    <div className="flex gap-5">
      <Avatar size="lg" isBordered src={imageUrl} />
      <div className="flex flex-col gap-1.5 items-start justify-center">
        <h1 className="text-lg font-semibold leading-none">
          {userData.user.name}
        </h1>
        <p className="text-sm tracking-tight text-zinc-400">
          @{userData.user.user_id}
        </p>
      </div>
    </div>
  );
}
