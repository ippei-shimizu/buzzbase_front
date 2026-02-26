interface MyPageLayoutProps {
  children: React.ReactNode;
}

const MyPageLayout = ({ children }: MyPageLayoutProps) => {
  return <div className="bg-main min-h-screen">{children}</div>;
};

export default MyPageLayout;
