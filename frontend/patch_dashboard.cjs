const fs = require('fs');
let content = fs.readFileSync('src/layouts/dashboard-layout.tsx', 'utf8');

// Add imports
if (!content.includes('react-hook-form')) {
  content = content.replace(
    "import { Input } from '@/components/ui/input'",
    "import { Input } from '@/components/ui/input'\nimport { useForm } from 'react-hook-form'\nimport { zodResolver } from '@hookform/resolvers/zod'\nimport { z } from 'zod'"
  );
}

// Add Schema
if (!content.includes('passwordSchema')) {
  const schema = `
const passwordSchema = z.object({
  old_password: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  new_password: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
  confirm_password: z.string().min(1, 'تأكيد كلمة المرور مطلوب')
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'كلمة المرور الجديدة غير متطابقة',
  path: ['confirm_password'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;
`;
  content = content.replace("function formatToday() {", schema + "\nfunction formatToday() {");
}

// Update State & hooks
content = content.replace(
  "const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' })",
  `const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { old_password: '', new_password: '', confirm_password: '' }
  })`
);

// Update mutation
content = content.replace(
  "mutationFn: (payload: { old_password: string; new_password: string; confirm_password: string }) =>",
  "mutationFn: (payload: PasswordFormValues) =>"
);

content = content.replace(
  "setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })",
  "resetPasswordForm()"
);
content = content.replace(
  "setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })",
  "resetPasswordForm()"
);
content = content.replace(
  "setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })",
  "resetPasswordForm()"
);

// Update JSX
content = content.replace(
  /<div className="mt-5 space-y-3">[\s\S]*?<\/div>[\s\S]*?\{passwordError && \([\s\S]*?\}\)[\s\S]*?<div className="mt-5 flex justify-end gap-2">/,
  `<form className="mt-5 space-y-3" onSubmit={handlePasswordSubmit((data) => passwordMutation.mutate(data))}>
                <div>
                  <Input
                    placeholder="كلمة المرور الحالية"
                    type="password"
                    {...registerPassword('old_password')}
                  />
                  {passwordErrors.old_password && <p className="mt-1 text-xs text-destructive">{passwordErrors.old_password.message}</p>}
                </div>
                <div>
                  <Input
                    placeholder="كلمة المرور الجديدة"
                    type="password"
                    {...registerPassword('new_password')}
                  />
                  {passwordErrors.new_password && <p className="mt-1 text-xs text-destructive">{passwordErrors.new_password.message}</p>}
                </div>
                <div>
                  <Input
                    placeholder="تأكيد كلمة المرور الجديدة"
                    type="password"
                    {...registerPassword('confirm_password')}
                  />
                  {passwordErrors.confirm_password && <p className="mt-1 text-xs text-destructive">{passwordErrors.confirm_password.message}</p>}
                </div>
              {passwordError && (
                <div className="mt-3 rounded-md border border-destructive-container bg-destructive-container/40 p-3 text-sm text-destructive-container-foreground">
                  {passwordError}
                </div>
              )}
              <div className="mt-5 flex justify-end gap-2">`
);

content = content.replace(
  /<Button\s*disabled=\{passwordMutation\.isPending\}\s*onClick=\{\(\) => passwordMutation\.mutate\(passwordForm\)\}\s*type="button"\s*>/,
  `<Button
                  disabled={passwordMutation.isPending}
                  type="submit"
                >`
);

// Close form
content = content.replace(
  /<\/Button>\s*<\/div>\s*<\/div>/,
  `</Button>
              </div>
            </form>
            </div>`
);


fs.writeFileSync('src/layouts/dashboard-layout.tsx', content);
console.log('done');
