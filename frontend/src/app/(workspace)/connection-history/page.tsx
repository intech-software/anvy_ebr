import type { Metadata } from "next";
import { ConnectionHistory } from "./connection-history";

export const metadata: Metadata = { title: "Lịch sử kết nối | Anvy EBR" };

export default function ConnectionHistoryPage() {
  return <ConnectionHistory />;
}
