const fs = require('fs');
let content = fs.readFileSync('src/features/workflows/pages/fingerprint-integration-page.tsx', 'utf8');

if (!content.includes('react-hook-form')) {
  content = content.replace(
    "import { Select } from '@/components/ui/select'",
    "import { Select } from '@/components/ui/select'\nimport { useForm } from 'react-hook-form'\nimport { zodResolver } from '@hookform/resolvers/zod'\nimport { z } from 'zod'"
  );
}

if (!content.includes('fingerprintSchema')) {
  const schema = `
const fingerprintSchema = z.object({
  device_finger_print: z.string().min(1, 'رقم الجهاز مطلوب'),
  user_id: z.string().min(1, 'رقم البصمة مطلوب'),
  timestamp: z.string().min(1, 'الوقت والتاريخ مطلوب'),
  status: z.string().min(1, 'الحالة مطلوبة'),
});

type FingerprintFormValues = z.infer<typeof fingerprintSchema>;
`;
  content = content.replace("const punchStatusOptions =", schema + "\nconst punchStatusOptions =");
}

content = content.replace(
  "  const [form, setForm] = useState({\n    device_finger_print: '',\n    user_id: '',\n    timestamp: currentDatetimeValue(),\n    status: 'in',\n  })",
  `  const {
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<FingerprintFormValues>({
    resolver: zodResolver(fingerprintSchema),
    defaultValues: {
      device_finger_print: '',
      user_id: '',
      timestamp: currentDatetimeValue(),
      status: 'in',
    }
  })
  
  const formDevice = watch('device_finger_print');
  const formUserId = watch('user_id');
  const formStatus = watch('status');
  const formTimestamp = watch('timestamp');`
);

content = content.replace(
  "    () =>\n      devicesQuery.data?.find(\n        (device) => String(device.id) === String(form.device_finger_print),\n      ),\n    [devicesQuery.data, form.device_finger_print],",
  "    () =>\n      devicesQuery.data?.find(\n        (device) => String(device.id) === String(formDevice),\n      ),\n    [devicesQuery.data, formDevice],"
);

content = content.replace(
  "  const buildPayload = (): PushPayload => ({\n      device_finger_print: Number(form.device_finger_print),\n      user_id: Number(form.user_id),\n      timestamp: toApiTimestamp(form.timestamp),\n      status: form.status,\n  })",
  "  const buildPayload = (): PushPayload => ({\n      device_finger_print: Number(formDevice),\n      user_id: Number(formUserId),\n      timestamp: toApiTimestamp(formTimestamp),\n      status: formStatus,\n  })"
);

content = content.replace(
  "  const submitPush = (event: React.FormEvent<HTMLFormElement>) => {\n    event.preventDefault()\n    setConfirmOpen(true)\n  }",
  "  const submitPush = handleSubmit((data) => {\n    setConfirmOpen(true)\n  })"
);

// Replace JSX bindings
content = content.replace(/value=\{form\.device_finger_print\}/g, "value={formDevice}");
content = content.replace(/value=\{form\.user_id\}/g, "value={formUserId}");
content = content.replace(/value=\{form\.status\}/g, "value={formStatus}");
content = content.replace(/value=\{form\.timestamp\}/g, "value={formTimestamp}");

content = content.replace(/onChange=\{\(event\) =>[\s\S]*?\}\}/g, "");
content = content.replace(/<Select\n\s*required\n\s*value=\{formDevice\}/, "<Select\n {...register('device_finger_print')} required\n value={formDevice}");
content = content.replace(/<Select\n\s*required\n\s*value=\{formStatus\}/, "<Select\n {...register('status')} required\n value={formStatus}");

content = content.replace(/<Input\n\s*min=\{1\}\n\s*required\n\s*type="number"\n\s*value=\{formUserId\}\n\s*\/>/, "<Input min={1} required type=\"number\" {...register('user_id')} />");
content = content.replace(/<Input\n\s*required\n\s*type="datetime-local"\n\s*value=\{formTimestamp\}\n\s*\/>/, "<Input required type=\"datetime-local\" {...register('timestamp')} />");


fs.writeFileSync('src/features/workflows/pages/fingerprint-integration-page.tsx', content);
console.log('done');
