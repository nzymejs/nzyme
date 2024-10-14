import SparkMd5 from 'spark-md5';

export function getMd5Hash(data: string): string {
    return SparkMd5.hash(data);
}
