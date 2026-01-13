import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User, Package, Heart, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'wouter';

export default function UserProfileDropdown() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <Link href="/prihlasenie">
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 h-8 px-2 text-xs font-medium">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Prihlásiť</span>
        </Button>
      </Link>
    );
  }

  const userInitial = user.email?.charAt(0).toUpperCase() || 'U';
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Používateľ';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 h-8 px-2">
          <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            {userInitial}
          </div>
          <span className="hidden sm:inline text-xs font-medium max-w-[100px] truncate">
            {userName}
          </span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/moj-ucet">
            <User className="mr-2 h-4 w-4" />
            <span>Môj účet</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/moje-objednavky">
            <Package className="mr-2 h-4 w-4" />
            <span>Moje objednávky</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/oblubene">
            <Heart className="mr-2 h-4 w-4" />
            <span>Obľúbené</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/nastavenia">
            <Settings className="mr-2 h-4 w-4" />
            <span>Nastavenia</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Odhlásiť sa</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
