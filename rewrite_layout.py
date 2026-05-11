import re

with open('frontend/src/layouts/dashboard-layout.tsx', 'r') as f:
    content = f.read()

# 1. Imports
# Ensure `resourceGroups` and `resourceGroupMeta` are imported
content = re.sub(
    r"import \{(.*?)\} from '@/features/resources/resource-config'",
    r"import {\1, resourceGroupMeta, resourceGroups} from '@/features/resources/resource-config'",
    content
)
# Fix double imports if already there
content = re.sub(r"resourceGroupMeta,\s*resourceGroups,\s*resourceGroupMeta,\s*resourceGroups", r"resourceGroupMeta, resourceGroups", content)

# 2. Add state and logic for Top Navbar
top_nav_logic = """
  const derivedTopNav = useMemo(() => {
    const res = resources.find((r) => location.pathname.startsWith(r.path))
    if (res) return res.group
    if (location.pathname.startsWith('/workflows') || location.pathname === '/') return 'operations'
    return 'operations'
  }, [location.pathname])

  const [activeTopNav, setActiveTopNav] = useState<string>(derivedTopNav)

  useEffect(() => {
    setActiveTopNav(derivedTopNav)
  }, [derivedTopNav])

  const currentSidebarLinks = useMemo(() => {
    const links = []
    
    // If operations, add workflow links first
    if (activeTopNav === 'operations') {
      links.push(
        { title: 'الرئيسية', href: '/', icon: Home },
        ...workflowLinks
      )
    }

    // Add resource links for the active group
    const groupResources = resources.filter((r) => r.group === activeTopNav)
    links.push(...groupResources.map(r => ({
      title: r.title,
      href: r.path,
      icon: r.icon
    })))

    return links
  }, [activeTopNav])
"""

content = re.sub(
    r"  const location = useLocation\(\)",
    top_nav_logic + "\n  const location = useLocation()",
    content
)

# 3. Replace the sidebar rendering
# We need to find the `<nav className="flex-1 space-y-1 overflow-y-auto p-4 no-scrollbar">` block
# and replace it entirely.
sidebar_nav_replacement = """        <nav className="flex-1 space-y-1 overflow-y-auto p-4 no-scrollbar">
          {currentSidebarLinks.map((item) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-white text-[#2b6278] shadow-sm'
                    : 'text-white/80 hover:bg-white/15 hover:text-white',
                )
              }
              key={item.href}
              onClick={() => setSidebarOpen(false)}
              to={item.href}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.title}</span>
            </NavLink>
          ))}
        </nav>"""

content = re.sub(
    r'        <nav className="flex-1 space-y-1 overflow-y-auto p-4 no-scrollbar">.*?</nav>',
    sidebar_nav_replacement,
    content,
    flags=re.DOTALL
)

# 4. Add the Top Navbar
# Inside `<div className="flex flex-1 flex-col overflow-hidden bg-background">`
# We have `<header className="...`
# We append the Top Navbar just below the `<header>`
top_navbar = """
        {/* Top Navbar */}
        <div className="border-b border-outline-variant bg-surface-container-low px-4 sm:px-6">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {Object.entries(resourceGroups).map(([groupKey, groupTitle]) => {
              const meta = resourceGroupMeta[groupKey as keyof typeof resourceGroups]
              const Icon = meta?.icon || Settings
              const isActive = activeTopNav === groupKey
              return (
                <button
                  key={groupKey}
                  onClick={() => setActiveTopNav(groupKey)}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-on-surface-variant hover:border-outline hover:text-on-surface"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {groupTitle}
                </button>
              )
            })}
          </div>
        </div>
"""

content = re.sub(
    r'(        </header>\n)(.*?{passwordModalOpen && \()',
    r'\1' + top_navbar + r'\2',
    content,
    flags=re.DOTALL
)

# 5. Remove the quick settings link from the user dropdown since settings page is gone
# Let's remove the "الإعدادات" link in the user menu.
content = re.sub(
    r'                <button\s*className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm transition-colors hover:bg-muted"\s*onClick=\{\(\) => \{\s*navigate\(\'/groups/settings\'\)\s*setActiveMenu\(null\)\s*\}\}\s*type="button"\s*>\s*<Settings className="h-4 w-4" />\s*الإعدادات\s*</button>',
    "",
    content,
    flags=re.DOTALL
)

with open('frontend/src/layouts/dashboard-layout.tsx', 'w') as f:
    f.write(content)

