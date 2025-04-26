export function Footer() {
  return (
    <footer className="py-8 border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
            © {new Date().getFullYear()} • Youssef Chouay • All Rights Reserved
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-mono">和 • 調和 • 簡素</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
