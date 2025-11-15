/**
 * Hook générique pour gérer les actions en masse (activate/deactivate)
 * Élimine la duplication de code pour les bulk actions
 */
export function useBulkActions<T extends { id: string; active: boolean; nameTranslations: any }>(
  selectedIds: string[],
  items: T[],
  updateFunction: (id: string, data: any) => Promise<any>,
  onSuccess: (successIds: string[], isActivating: boolean) => void,
  onError: (message: string) => void,
  getUpdatePayload: (item: T, active: boolean) => any
) {
  const executeBulkAction = async (activate: boolean) => {
    if (selectedIds.length === 0) return

    const results = await Promise.allSettled(
      selectedIds.map(async (id) => {
        const item = items.find((i) => i.id === id)
        if (item && item.active !== activate) {
          try {
            const payload = getUpdatePayload(item, activate)
            await updateFunction(id, payload)
            return { id, success: true }
          } catch (err: any) {
            console.error(`Failed to ${activate ? 'activate' : 'deactivate'} item ${id}:`, err.response?.data?.message || err.message)
            return { id, success: false, error: err.response?.data?.message || err.message }
          }
        }
        return { id, success: true, skipped: true }
      })
    )

    const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success && !r.value.skipped)
    const failed = results.filter((r) => r.status === 'fulfilled' && !r.value.success)

    const successIds = succeeded.map((r: any) => r.value.id)
    onSuccess(successIds, activate)

    if (failed.length > 0) {
      onError(`${succeeded.length} item(s) ${activate ? 'activated' : 'deactivated'}, ${failed.length} failed.`)
    }
  }

  const handleBulkActivate = () => executeBulkAction(true)
  const handleBulkDeactivate = () => executeBulkAction(false)

  return {
    handleBulkActivate,
    handleBulkDeactivate,
  }
}

