"use client";

import { Fragment, useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useAddFavoriteDialog } from "@/store/useAddFavoriteDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  favouriteSchema,
  FavouriteFormValues,
} from "@/schemas/favouriteSchema";
import debounce from "lodash.debounce";
import { addFavourite } from "@/actions/favourites";

interface GeoLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export const AddFavoriteDialog = () => {
  const { isOpen, close } = useAddFavoriteDialog();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FavouriteFormValues>({
    resolver: zodResolver(favouriteSchema),
    defaultValues: { name: "", lat: 0, lon: 0 },
  });

  const nameValue = watch("name");

  useEffect(() => {
    if (!nameValue || nameValue.length < 2) {
      setSearchResults([]);
      return;
    }

    const handler = debounce(async () => {
      try {
        const res = await fetch(
          `/api/geocode?query=${encodeURIComponent(nameValue)}`
        );
        if (res.ok) {
          const data: GeoLocation[] = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 500);

    handler();

    // Cleanup debounce on unmount or name change
    return () => handler.cancel();
  }, [nameValue]);

  const onSubmit = async (values: FavouriteFormValues) => {
    setLoading(true);
    try {
      await addFavourite(values);
      close();
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={close}>
        {/* Overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>

        {/* Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <DialogTitle className="text-lg font-medium">
                    Add New Favourite
                  </DialogTitle>
                  <button
                    onClick={close}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Search Location"
                      {...register("name")}
                      className="w-full border rounded px-3 py-2"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {searchResults.length > 0 && (
                    <ul className="border rounded max-h-40 overflow-y-auto">
                      {searchResults.map((loc, idx) => (
                        <li
                          key={idx}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setValue("name", `${loc.name}, ${loc.country}`);
                            setValue("lat", Number(loc.lat.toFixed(7)));
                            setValue("lon", Number(loc.lon.toFixed(7)));
                            setSearchResults([]);
                          }}
                        >
                          {loc.name}, {loc.state ? loc.state + ", " : ""}
                          {loc.country}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div>
                    <input
                      type="number"
                      step="0.0000001"
                      placeholder="Latitude"
                      {...register("lat", { valueAsNumber: true })}
                      className="w-full border rounded px-3 py-2"
                    />
                    {errors.lat && (
                      <p className="text-red-500 text-sm">
                        {errors.lat.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="number"
                      step="0.0000001"
                      placeholder="Longitude"
                      {...register("lon", { valueAsNumber: true })}
                      className="w-full border rounded px-3 py-2"
                    />
                    {errors.lon && (
                      <p className="text-red-500 text-sm">
                        {errors.lon.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={close}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
