import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

const nextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      if (account && account.provider === "google") {
        const provider = account?.provider;
        const { email, image } = user;
        try {
          const response = await axios.post(
            `${process.env.NEXTAUTH_URL}/api/v1/auth/${provider}/callback`,
            {
              user: {
                provider: "google",
                uid: email,
                image: image,
              },
            }
          );
          console.log("レスポンス:", response.data);
        } catch (error) {
          console.error("ユーザー情報の保存に失敗しました。", error);
          return false;
        }
      }
      return true;
    },
  },
};

export const GET = (req: any, res: any) => NextAuth(req, res, nextAuthOptions);
export const POST = (req: any, res: any) => NextAuth(req, res, nextAuthOptions);
