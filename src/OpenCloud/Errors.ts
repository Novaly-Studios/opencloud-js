type OpenCloudErrorReason = "INVALID_ARGUMENT" | "INSUFFICIENT_SCOPE" | "NOT_FOUND" | "RESOURCE_EXHAUSTED" | "INTERNAL"

type InternalError = "Unknown"
type NotFoundError = "DatastoreNotFound" | "EntryNotFound" | "VersionNotFound"
type InvalidArgumentError = "ContentLengthRequired" | "InvalidUniverseId" | "InvalidCursor" | "InvalidVersionId" | "ExistingValueNotNumeric" | "IncrementValueTooLarge" | "IncrementValueTooSmall" | "InvalidDataStoreScope" | "InvalidEntryKey" | "InvalidDataStoreName" | "InvalidStartTime" | "InvalidEndTime" | "InvalidAttributes" | "InvalidUserIds" | "ContentMd5Required" | "InvalidLimit" | "ExclusiveCreateAndMatchVersionCannotBeSet" | "ContentTooBig" | "ChecksumMismatch" | "ContentNotJson" | "InvalidSortOrder"
type InsufficientScopeError = "Forbidden" | "InsufficientScope"
type ResourceExhaustedError = "TooManyRequests"

// sloppy
export class OpenCloudError extends Error {
    constructor(message: string) {
        super(message);

        this.name = "OpenCloudError";
    }
}

export class DataStoreError extends OpenCloudError {
    public dataStoreReason: InvalidArgumentError | InsufficientScopeError | NotFoundError | ResourceExhaustedError | InternalError;
    public openCloudReason: OpenCloudErrorReason;

    constructor(message: string, openCloudReason: "INVALID_ARGUMENT", dataStoreReason: InvalidArgumentError)
    constructor(message: string, openCloudReason: "INSUFFICIENT_SCOPE", dataStoreReason: InsufficientScopeError)
    constructor(message: string, openCloudReason: "NOT_FOUND", dataStoreReason: NotFoundError)
    constructor(message: string, openCloudReason: "RESOURCE_EXHAUSTED", dataStoreReason: ResourceExhaustedError)
    constructor(message: string, openCloudReason: "INTERNAL", dataStoreReason: InternalError)
    constructor(message: string, openCloudReason: OpenCloudErrorReason, dataStoreReason: InvalidArgumentError | InsufficientScopeError | NotFoundError | ResourceExhaustedError | InternalError) {
        super(message);

        this.name = "DataStoreError";
        this.dataStoreReason = dataStoreReason;
        this.openCloudReason = openCloudReason;
    }
}