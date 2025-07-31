import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QaSampleReceiving from "./qa-sample-receiving";
import QaTestResults from "./qa-test-results";

export default function QaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2 thai-font">
          QA Management
        </h2>
        <p className="text-muted-foreground thai-font">
          จัดการตัวอย่างและรายงานผลการทดสอบ
        </p>
      </div>

      <Tabs defaultValue="sample-receiving" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-4">
          <TabsTrigger
            value="sample-receiving"
            className="thai-font bg-green-50 hover:bg-green-100 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 dark:bg-green-900/20 dark:hover:bg-green-800/30 dark:data-[state=active]:bg-green-800/30 dark:data-[state=active]:text-green-200 transition-colors"
          >
            รับตัวอย่าง
          </TabsTrigger>
          <TabsTrigger
            value="test-results"
            className="thai-font bg-green-50 hover:bg-green-100 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 dark:bg-green-900/20 dark:hover:bg-green-800/30 dark:data-[state=active]:bg-green-800/30 dark:data-[state=active]:text-green-200 transition-colors"
          >
            ลงผลการทดสอบ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sample-receiving" className="mt-6">
          <QaSampleReceiving />
        </TabsContent>

        <TabsContent value="test-results" className="mt-6">
          <QaTestResults />
        </TabsContent>
      </Tabs>

    </div>
  );
}
