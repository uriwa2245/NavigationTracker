import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QaSampleReceiving from "./qa-sample-receiving";
import QaTestResults from "./qa-test-results";

export default function QaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 thai-font">
          QA Managent
        </h2>
        <p className="text-gray-600 dark:text-gray-400 thai-font">
          จัดการตัวอย่างและรายงานผลการทดสอบ
        </p>
      </div>

      <Tabs defaultValue="sample-receiving" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sample-receiving" className="thai-font">
            รับตัวอย่าง
          </TabsTrigger>
          <TabsTrigger value="test-results" className="thai-font">
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
