import type { Metadata } from "next";
import GalleryView from "@/components/GalleryView";
import { EVENT } from "@/lib/event";

export const metadata: Metadata = {
  title: `Gallery | ${EVENT.title}`,
};

export default function GalleryPage() {
  return <GalleryView />;
}
