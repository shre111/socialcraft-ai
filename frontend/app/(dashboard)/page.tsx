import { CaptionGenerator } from '@/components/caption/CaptionGenerator'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Caption Generator</h1>
        <p className="text-gray-500 mt-1">
          Describe your topic and let AI craft the perfect caption for you.
        </p>
      </div>
      <CaptionGenerator />
    </div>
  )
}
