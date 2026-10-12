import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Notification } from "@/components/admin/notification";
import { Error } from "@/components/admin/error";
import { Skeleton } from "@/components/ui/skeleton";

import { DataImportProvider } from "../dataImport/DataImportProvider";
import { useConfigurationLoader } from "../root/useConfigurationLoader";
import { useDocumentDirection } from "./useDocumentDirection";
import { DirectionProvider } from "@radix-ui/react-direction";
import Header from "./Header";

export const Layout = ({ children }: { children: ReactNode }) => {
  useConfigurationLoader();
  const dir = useDocumentDirection();
  return (
    <DirectionProvider dir={dir}>
      <DataImportProvider>
        <Header />
        <main className="max-w-screen-xl mx-auto p-4" id="main-content">
          <ErrorBoundary FallbackComponent={Error}>
            <Suspense
              fallback={<Skeleton className="h-12 w-12 rounded-full" />}
            >
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
        <Notification />
      </DataImportProvider>
    </DirectionProvider>
  );
};
