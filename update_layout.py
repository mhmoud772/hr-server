import re

with open('frontend/src/layouts/dashboard-layout.tsx', 'r') as f:
    content = f.read()

# Remove sidebarSearchTerm state
content = re.sub(r"  const \[sidebarSearchTerm, setSidebarSearchTerm\] = useState\(''\)\n", "", content)

# Remove expandedGroups and openGroups state
content = re.sub(
    r"  const \[expandedGroups, setExpandedGroups\] = useState<Record<string, boolean>>\(\{\}\)\n  const \[openGroups, setOpenGroups\] = useState<Record<string, boolean>>\(\(\) => \{.*?\n  \}\)\n",
    "",
    content,
    flags=re.DOTALL
)

# Remove useEffect for openGroups localStorage
content = re.sub(
    r"  useEffect\(\(\) => \{\n    localStorage\.setItem\('sidebar_open_groups', JSON\.stringify\(openGroups\)\)\n  \}, \[openGroups\]\)\n",
    "",
    content
)

# Remove activeResource, activeGroup, normalizedSidebarSearch
content = re.sub(
    r"  const activeResource = useMemo\(\n.*?\[location\.pathname\],\n  \)\n  const activeGroup = useMemo\(\(\) => \{\n.*?\}, \[activeResource, location\.pathname\]\)\n\n  const normalizedSidebarSearch = sidebarSearchTerm\.trim\(\)\.toLowerCase\(\)\n",
    "",
    content,
    flags=re.DOTALL
)

# Add Settings to pageTitle
content = re.sub(
    r"return 'النظام'",
    r"if (location.pathname === '/settings') return 'الإعدادات والنظام'\n\n    return 'النظام'",
    content
)

# Replace the resource groups rendering in sidebar with a static Settings link
# We need to find: <div className="space-y-2"> ... </nav> and replace it.
sidebar_settings = """          <div className="space-y-1 mt-6 border-t border-white/15 pt-4">
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white',
                  isActive && 'bg-white text-[#2b6278] shadow-sm',
                )
              }
              onClick={() => setSidebarOpen(false)}
              to="/settings"
            >
              <Settings className="h-5 w-5 shrink-0" />
              <span className="truncate">الإعدادات والنظام</span>
            </NavLink>
          </div>
        </nav>"""

content = re.sub(
    r'          <div className="space-y-2">\s+<p className="px-3 pb-1 text-xs font-semibold text-white/55">.*?</nav>',
    sidebar_settings,
    content,
    flags=re.DOTALL
)

# Remove sidebar search input
content = re.sub(
    r'          <div className="relative">\s*<Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />\s*<Input\s*className="border-white/15 bg-white/10 pr-9 text-white placeholder:text-white/45 focus-visible:ring-white/30"\s*onChange=\{\(event\) => setSidebarSearchTerm\(event\.target\.value\)\}\s*placeholder="بحث في القائمة"\s*value=\{sidebarSearchTerm\}\s*/>\s*</div>',
    "",
    content,
    flags=re.DOTALL
)

# Remove resourceGroupMeta, resourceGroups, resources if not used? They are still used in pageTitle
# Remove groupDescriptions
content = re.sub(
    r"const groupDescriptions = \{.*?} as const\n",
    "",
    content,
    flags=re.DOTALL
)

with open('frontend/src/layouts/dashboard-layout.tsx', 'w') as f:
    f.write(content)

