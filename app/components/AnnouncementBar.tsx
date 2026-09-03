import { Truck } from "lucide-react";

export default function AnnounementBar() {
  return (
    <p className="flex px-5 lg:px-20 justify-center items-center h-fit py-2 gap-3 font-jost font-semibold text-xs text-gold bg-espresso uppercase">
      <Truck size={22} /> Free shipping on all orders above PKR 3,000
    </p>
  );
}
