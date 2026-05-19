import { type EventoHistorialDTO } from "./EventoHistorialDTO"

export type HistorialSort = {
	empty: boolean
	sorted: boolean
	unsorted: boolean
}

export type HistorialPageable = {
	offset: number
	paged: boolean
	pageNumber: number
	pageSize: number
	sort: HistorialSort
	unpaged: boolean
}

export type HistorialPageResponse = {
	totalElements: number
	totalPages: number
	size: number
	content: EventoHistorialDTO[]
	number: number
	numberOfElements: number
	pageable: HistorialPageable
	sort: HistorialSort
	first: boolean
	last: boolean
	empty: boolean
}
