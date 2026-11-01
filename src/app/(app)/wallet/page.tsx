import { WalletView } from "@/features/wallet/WalletView";

export default function WalletPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-3xl font-extrabold">Wallet</h1>
      <WalletView />
    </div>
  );
}
