"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Favourite } from "@/types/favourite";
import { useDeleteFavouriteDialog } from "@/store/useDeleteFavouriteDialog";
import Link from "next/link";

interface ThreeDotsMenuProps {
  location: Favourite;
}

export const ThreeDotsMenu = ({ location }: ThreeDotsMenuProps) => {
  const { open } = useDeleteFavouriteDialog();

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="p-1 rounded hover:bg-white/20 focus:outline-none">
        <EllipsisVerticalIcon className="w-5 h-5" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 mt-2 w-40 origin-top-right rounded bg-white text-black shadow-lg ring-1 ring-black/5 focus:outline-none"
      >
        <div className="py-1">
          <MenuItem>
            <Link
              href={`/${location.id}`}
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              View Details
            </Link>
          </MenuItem>
          <MenuItem>
            <button
              onClick={() => open(location)}
              className="block w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Delete
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
};
