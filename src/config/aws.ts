import { Endpoint } from "aws-sdk";
import { getAwsRegion, getKmsKeyId } from "../config";

export interface KmsConfig {
  awsConfig: AwsConfig;
  kmsKeyId: string;
}

export interface AwsConfig {
  endpoint?: Endpoint;
  accessKeyId?: string;
  secretAccessKey?: string;
  region: string;
}

export function getKMSConfig(): KmsConfig {
  return {
    awsConfig: {
      region: getAwsRegion(),
    },
    kmsKeyId: getKmsKeyId(),
  };
}
