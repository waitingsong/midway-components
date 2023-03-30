import { alibabaCloudEcsDetector } from '@opentelemetry/resource-detector-alibaba-cloud'
import { awsEc2Detector, awsEksDetector } from '@opentelemetry/resource-detector-aws'
import { containerDetector } from '@opentelemetry/resource-detector-container'
import { gcpDetector } from '@opentelemetry/resource-detector-gcp'
import { resources } from '@opentelemetry/sdk-node'


const detectors = [
  containerDetector,
  resources.envDetectorSync,
  resources.hostDetectorSync,
  resources.osDetectorSync,
  resources.processDetectorSync,

  alibabaCloudEcsDetector,
  // Ordered AWS Resource Detectors as per:
  // https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/resourcedetectionprocessor/README.md#ordering
  awsEksDetector,
  awsEc2Detector,
  gcpDetector,
]


export const detectorResources = resources.detectResourcesSync({
  detectors,
})

