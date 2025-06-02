import NavigationBarre from "@/components/design/navigation/navigationBarre";
import Footer from "@/components/design/sections/footer";
import Loader from "@/components/Loader";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <NavigationBarre
                children={children} // Pass the children prop to NavigationBarre
            />
            <Loader/>
            <Footer />
        </>
    );
}
