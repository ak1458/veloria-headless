import LegacyHomePage from "@/components/LegacyHomePage";

export const revalidate = 300; // ISR: refresh every 5 minutes

export const metadata = {
  title: "Veloria Vault | Luxury Leather Handbags",
  description: "Timeless leather goods for the modern minimalist. Handcrafted genuine leather handbags, totes, satchels and clutches.",
};

export default function HomePage() {
  return <LegacyHomePage />;
}
