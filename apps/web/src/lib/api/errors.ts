/** What a failed API call looks like to the UI: an axios error with the API's `{ message }` body. */
export type ApiErrorLike = {
	message?: string;
	response?: { status?: number; data?: { message?: string } };
};
