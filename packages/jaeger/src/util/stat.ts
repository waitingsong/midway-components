import { retrieveProcInfo } from '@waiting/shared-core'
import { ProcCpuinfo, ProcMeminfo, ProcStat } from '@waiting/shared-types'

import { TracerLog } from '../lib/types'


export type SampleProcInfo = Record<string, Partial<ProcCpuinfo | ProcMeminfo | ProcStat>>

export async function procInfo(): Promise<SampleProcInfo> {
  const info = await retrieveProcInfo()
  const { cpuinfo, meminfo, stat } = info
  const ret: Record<string, Partial<ProcCpuinfo | ProcMeminfo | ProcStat>> = { }

  ret[TracerLog.procCpuinfo] = {
    'cache size': cpuinfo['cache size'],
    'core id': cpuinfo['core id'],
    'cpu cores': cpuinfo['cpu cores'],
    'cpu MHz': cpuinfo['cpu MHz'],
    'model name': cpuinfo['model name'],
    processor: cpuinfo.processor,
    vendor_id: cpuinfo.vendor_id,
  }

  ret[TracerLog.procMeminfo] = {
    Active: meminfo.Active,
    'Active(anon)': meminfo['Active(anon)'],
    'Active(file)': meminfo['Active(file)'],
    AnonHugePages: meminfo.AnonHugePages,
    AnonPages: meminfo.AnonPages,
    Buffers: meminfo.Buffers,
    Cached: meminfo.Cached,
    Dirty: meminfo.Dirty,
    Inactive: meminfo.Inactive,
    'Inactive(anon)': meminfo['Inactive(anon)'],
    'Inactive(file)': meminfo['Inactive(file)'],
    Mapped: meminfo.Mapped,
    MemAvailable: meminfo.MemAvailable,
    MemFree: meminfo.MemFree,
    MemTotal: meminfo.MemTotal,
    Shmem: meminfo.Shmem,
    SwapCached: meminfo.SwapCached,
    SwapFree: meminfo.SwapFree,
    SwapTotal: meminfo.SwapTotal,
    Writeback: meminfo.Writeback,
  }

  stat.intr = 'stripped'
  ret[TracerLog.procStat] = stat

  return ret
}
