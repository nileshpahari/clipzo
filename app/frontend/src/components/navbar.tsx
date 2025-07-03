import { getServerSession } from "next-auth";
import Link from "next/link";
import Logo from "@/components/logo";
import { FaUser as User } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggler";
export default async function Navbar() {
    const session = await getServerSession();
    return (
        <div>
            <div className="flex justify-between items-center py-4 px-8">
                <div><Link href="/"><Logo/></Link></div>
                <div className="flex gap-4">
                    <ThemeToggle/>
                    {session ? (
                        <Link href="/profile">
                        <Button><User className="h-4 w-4"/></Button>
                        </Link>
                    ) : (
                        <Link href="/signin">
                        <Button className="px-4 py-2 rounded-sm2">Login</Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}