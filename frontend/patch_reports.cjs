const fs = require('fs');
let content = fs.readFileSync('src/features/workflows/pages/reports-page.tsx', 'utf8');

if (!content.includes('react-hook-form')) {
  content = content.replace(
    "import { Input } from '@/components/ui/input'",
    "import { Input } from '@/components/ui/input'\nimport { useForm } from 'react-hook-form'\nimport { zodResolver } from '@hookform/resolvers/zod'\nimport { z } from 'zod'"
  );
}

if (!content.includes('reportSchema')) {
  const schema = `
const reportSchema = z.object({
  month: z.string().min(1, 'الشهر مطلوب'),
});

type ReportFormValues = z.infer<typeof reportSchema>;
`;
  content = content.replace("export function ReportsPage() {", schema + "\nexport function ReportsPage() {");
}

content = content.replace(
  "const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))",
  `const { register, watch } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: { month: new Date().toISOString().slice(0, 7) }
  })
  
  const month = watch('month')`
);

content = content.replace(/onChange=\{\(event\) => setMonth\(event.target.value\)\}/, "");
content = content.replace(/value=\{month\}/, "{...register('month')}");

content = content.replace(/import { useState } from 'react'\n/, "");

fs.writeFileSync('src/features/workflows/pages/reports-page.tsx', content);
console.log('done');
