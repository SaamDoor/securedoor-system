import { redirect } from 'next/navigation'

/** Hub collapses to the single live tool. */
export default function ToolsIndexPage() {
  redirect('/tools/materials-calculator')
}
