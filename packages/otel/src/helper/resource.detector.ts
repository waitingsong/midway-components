import { alibabaCloudEcsDetector } from '@opentelemetry/resource-detector-alibaba-cloud'
import {
  detectResourcesSync,
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
} from '@opentelemetry/resources'


export const detectorResources = detectResourcesSync({
  detectors: [
    envDetector,
    hostDetector,
    osDetector,
    processDetector,
    alibabaCloudEcsDetector,
  ],
})

