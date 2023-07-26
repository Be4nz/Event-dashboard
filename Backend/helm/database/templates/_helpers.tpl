{{/*
Expand the name of the chart.
*/}}
{{- define "database.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "database.fullname" -}}
{{- printf "%s-%s" .Release.Namespace .Release.Name  | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "database.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "database.labels" -}}
helm.sh/chart: {{ include "database.chart" . }}
{{ include "database.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "database.selectorLabels" -}}
app.kubernetes.io/name: {{ include "database.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Determinates port based on database type
*/}}
{{- define "database.port" -}}
{{- if eq .Values.type "postgresql" }}
{{- 5432 }}
{{ else if eq .Values.type "mssql" }}
{{- 1433 }}
{{- end }}
{{- end }}

{{/*
Determinates image based on database type
*/}}
{{- define "database.image" -}}
{{- if eq .Values.type "postgresql" }}
{{- "postgres:latest" }}
{{ else if eq .Values.type "mssql" }}
{{- "mcr.microsoft.com/mssql/server:latest" }}
{{- end }}
{{- end }}
