<template>
  <div class="admin-scanner">
    <div class="ambient-grid"></div>
    <div class="ambient-scan"></div>

    <header class="page-heading page-enter">
      <div>
        <p class="eyebrow">08 / SYSTEM SCANNER</p>
        <h1>コードスキャナー</h1>
        <p class="description">
          RuboCop・Brakeman・Bundler Auditによるコード品質・セキュリティ・依存関係の検査を実行します
        </p>
      </div>

      <div class="header-actions">
        <button
          type="button"
          class="refresh-button"
          :disabled="isRefreshing"
          @click="refreshScanner"
        >
          <span
            class="refresh-icon"
            :class="{ spinning: isRefreshing }"
          >
            ↻
          </span>
          <span>
            {{ isRefreshing ? 'REFRESHING...' : 'Result Refresh' }}
          </span>
        </button>
      </div>
    </header>

    <section class="status-banner page-enter delay-1">
      <div class="status-banner-left">
        <div
          class="status-indicator"
          :class="scannerStatusClass"
        >
          <span></span>
        </div>

        <div>
          <p class="status-label">
            SCANNER STATUS
          </p>
          <strong>
            {{ scannerStatusLabel }}
          </strong>
          <p class="status-message">
            {{ scannerStatusMessage }}
          </p>
        </div>
      </div>

      <div class="last-check">
        <span>LAST CHECK</span>
        <strong>
          {{ formattedLastCheck }}
        </strong>
      </div>
    </section>

    <section class="monitor-grid page-enter delay-2">
      <article
        v-for="tool in toolCards"
        :key="tool.key"
        class="monitor-card"
      >
        <div class="card-scan"></div>

        <div class="monitor-card-header">
          <div>
            <p class="card-eyebrow">
              {{ tool.code }}
            </p>
            <h2>
              {{ tool.label }}
            </h2>
          </div>

          <span
            class="state-badge"
            :class="tool.status"
          >
            <span></span>
            {{ tool.statusLabel }}
          </span>
        </div>

        <p class="tool-description">
          {{ tool.description }}
        </p>

        <div class="tool-readout">
          <div>
            <span>
              {{ tool.primaryLabel }}
            </span>
            <strong>
              {{ tool.primaryValue }}
            </strong>
          </div>

          <div>
            <span>
              {{ tool.secondaryLabel }}
            </span>
            <strong>
              {{ tool.secondaryValue }}
            </strong>
          </div>
        </div>

        <div class="tool-footer">
          <span>
            EXECUTION TIME
          </span>
          <strong>
            {{ formatDuration(tool.duration) }}
          </strong>
        </div>
      </article>
    </section>

    <section class="metrics-grid page-enter delay-3">
      <article class="metric-card">
        <div class="metric-scan"></div>
        <span class="metric-label">
          CODE QUALITY
        </span>
        <strong>
          {{ totalCodeQuality }}
        </strong>
        <small>
          RUBOCOP OFFENSES
        </small>
      </article>

      <article class="metric-card">
        <div class="metric-scan"></div>
        <span class="metric-label">
          SECURITY
        </span>
        <strong>
          {{ totalSecurity }}
        </strong>
        <small>
          BRAKEMAN WARNINGS
        </small>
      </article>

      <article class="metric-card">
        <div class="metric-scan"></div>
        <span class="metric-label">
          DEPENDENCIES
        </span>
        <strong>
          {{ totalDependencies }}
        </strong>
        <small>
          BUNDLER AUDIT FINDINGS
        </small>
      </article>

      <article class="metric-card">
        <div class="metric-scan"></div>
        <span class="metric-label">
          INSPECTED FILES
        </span>
        <strong>
          {{ inspectedFiles }}
        </strong>
        <small>
          RUBOCOP FILES
        </small>
      </article>
    </section>

    <section class="panel scan-control-panel page-enter delay-4">
      <div class="panel-header">
        <div>
          <p class="panel-eyebrow">
            SCAN CONTROL
          </p>
          <h2>
            コードスキャン実行
          </h2>
        </div>

        <span class="panel-live">
          <span></span>
          {{ isScanning ? 'PROCESSING' : 'READY' }}
        </span>
      </div>

      <div class="scan-control-content">
        <div class="scan-control-copy">
          <strong>
            {{
              isScanning
                ? 'システムコードを解析しています'
                : 'システムコードを解析できます'
            }}
          </strong>
          <p>
            3つの解析ツールを順番に実行し、結果をScanRunとして保存します。
          </p>
        </div>

        <button
          type="button"
          class="run-scan-button"
          :disabled="isScanning || isLoading"
          @click="startScan"
        >
          <span
            class="run-scan-icon"
            :class="{ active: isScanning }"
          >
            {{ isScanning ? '◌' : '▶' }}
          </span>
          <span>
            {{ isScanning ? 'SCANNING...' : 'RUN SCAN' }}
          </span>
        </button>
      </div>

      <div class="scan-progress">
        <div
          class="scan-progress-bar"
          :class="{ active: isScanning }"
        >
          <span></span>
        </div>

        <div class="scan-progress-meta">
          <span>
            SCAN ENGINE / SOLID QUEUE
          </span>
          <strong>
            {{
              currentScan
                ? `SCAN #${currentScan.id}`
                : 'NO ACTIVE SCAN'
            }}
          </strong>
        </div>
      </div>
    </section>

    <section class="panel page-enter delay-5">
      <div class="panel-header">
        <div>
          <p class="panel-eyebrow">
            ANALYSIS PIPELINE
          </p>
          <h2>
            解析パイプライン
          </h2>
        </div>

        <span class="pipeline-count">
          {{ completedToolCount }} / 3 COMPLETED
        </span>
      </div>

      <div class="pipeline">
        <div
          v-for="(tool, index) in pipelineTools"
          :key="tool.key"
          class="pipeline-item"
        >
          <div class="pipeline-node">
            <span>
              {{ index + 1 }}
            </span>
          </div>

          <div class="pipeline-content">
            <div class="pipeline-title-row">
              <strong>
                {{ tool.label }}
              </strong>
              <span
                class="pipeline-status"
                :class="tool.status"
              >
                {{ tool.statusLabel }}
              </span>
            </div>

            <span>
              {{ tool.description }}
            </span>
          </div>

          <div
            v-if="tool.hasConnector"
            class="pipeline-line"
          >
            <span
              :class="{
                active: tool.connectorActive
              }"
            ></span>
          </div>
        </div>
      </div>
    </section>

    <section class="detail-grid page-enter delay-5">
      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">
              SCAN SUMMARY
            </p>
            <h2>
              スキャン概要
            </h2>
          </div>

          <span
            v-if="currentScan"
            class="history-period"
          >
            SCAN #{{ currentScan.id }}
          </span>
        </div>

        <div
          v-if="!currentScan"
          class="empty-state"
        >
          <div class="empty-icon">
            ⌕
          </div>
          <strong>
            スキャン結果がありません
          </strong>
          <span>
            SCAN RESULT / EMPTY
          </span>
        </div>

        <div
          v-else
          class="summary-list"
        >
          <div class="summary-row">
            <span>STATUS</span>
            <strong
              :class="
                statusTextClass(
                  currentScan.status
                )
              "
            >
              {{ formatStatus(currentScan.status) }}
            </strong>
          </div>

          <div class="summary-row">
            <span>CREATED AT</span>
            <strong>
              {{ formatDateTime(currentScan.created_at) }}
            </strong>
          </div>

          <div class="summary-row">
            <span>STARTED AT</span>
            <strong>
              {{ formatDateTime(currentScan.started_at) }}
            </strong>
          </div>

          <div class="summary-row">
            <span>FINISHED AT</span>
            <strong>
              {{ formatDateTime(currentScan.finished_at) }}
            </strong>
          </div>

          <div class="summary-row">
            <span>DURATION</span>
            <strong>
              {{ formatDuration(currentScan.duration_ms) }}
            </strong>
          </div>

          <div class="summary-row">
            <span>TRIGGERED BY</span>
            <strong>
              {{ currentScan.triggered_by ?? 'SYSTEM' }}
            </strong>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel-header">
          <div>
            <p class="panel-eyebrow">
              AUDIT SEVERITY
            </p>
            <h2>
              重要度別検出数
            </h2>
          </div>

          <span class="history-period">
            CURRENT RESULT
          </span>
        </div>

        <div class="severity-grid">
          <div class="severity-card high">
            <span>HIGH</span>
            <strong>
              {{ severityCounts.high }}
            </strong>
            <small>
              HIGH SEVERITY
            </small>
          </div>

          <div class="severity-card medium">
            <span>MEDIUM</span>
            <strong>
              {{ severityCounts.medium }}
            </strong>
            <small>
              MEDIUM SEVERITY
            </small>
          </div>

          <div class="severity-card low">
            <span>LOW</span>
            <strong>
              {{ severityCounts.low }}
            </strong>
            <small>
              LOW SEVERITY
            </small>
          </div>
        </div>
      </article>
    </section>

    <section class="panel findings-panel page-enter delay-5">
      <div
        class="panel-header findings-header findings-toggle"
        @click="showFindings = !showFindings"
      >
        <div>
          <p class="panel-eyebrow">
            SCAN FINDINGS
          </p>
          <h2>
            検出結果
          </h2>
          <p class="panel-description">
            {{
              showFindings
                ? '任意の検出項目をクリックすると詳細を表示します'
                : 'クリックすると検出結果を展開します'
            }}
          </p>
        </div>

        <div class="findings-header-actions">
          <div class="finding-header-meta">
            <span class="result-dot"></span>
            <span>
              {{ filteredFindings.length }} FINDINGS
            </span>
          </div>

          <span
            class="findings-toggle-icon"
            :class="{ open: showFindings }"
          >
            ＋
          </span>
        </div>
      </div>

      <Transition name="findings-collapse">
        <div
          v-if="showFindings"
          class="findings-content"
        >
          <div class="filter-row">
            <div class="filter-group">
              <button
                type="button"
                :class="{
                  active:
                    findingToolFilter === 'all'
                }"
                @click.stop="
                  findingToolFilter = 'all'
                "
              >
                ALL
              </button>

              <button
                type="button"
                :class="{
                  active:
                    findingToolFilter === 'brakeman'
                }"
                @click.stop="
                  findingToolFilter = 'brakeman'
                "
              >
                BRAKEMAN
              </button>

              <button
                type="button"
                :class="{
                  active:
                    findingToolFilter === 'bundler_audit'
                }"
                @click.stop="
                  findingToolFilter = 'bundler_audit'
                "
              >
                BUNDLER AUDIT
              </button>

              <button
                type="button"
                :class="{
                  active:
                    findingToolFilter === 'rubocop'
                }"
                @click.stop="
                  findingToolFilter = 'rubocop'
                "
              >
                RUBOCOP
              </button>
            </div>

            <div
              class="search-box"
              @click.stop
            >
              <span>⌕</span>
              <input
                v-model="findingSearch"
                type="text"
                placeholder="ファイル・ルール・メッセージを検索"
              />
            </div>
          </div>

          <div
            v-if="filteredFindings.length === 0"
            class="empty-state findings-empty"
          >
            <div class="empty-icon">
              ✓
            </div>
            <strong>
              該当する検出結果はありません
            </strong>
            <span>
              FINDINGS / CLEAR
            </span>
          </div>

          <div
            v-else
            class="finding-list"
          >
            <button
              v-for="(
                finding,
                index
              ) in filteredFindings"
              :key="
                `${finding.tool}-${finding.file}-${finding.line}-${index}`
              "
              type="button"
              class="finding-row"
              :class="
                severityClass(
                  finding.severity
                )
              "
              @click="
                openFindingDetail(finding)
              "
            >
              <span class="finding-scan"></span>

              <div class="finding-marker">
                <span>
                  {{ index + 1 }}
                </span>
              </div>

              <div class="finding-main">
                <div class="finding-top">
                  <span class="finding-tool">
                    {{ finding.tool.toUpperCase() }}
                  </span>

                  <span
                    class="finding-severity"
                    :class="
                      severityClass(
                        finding.severity
                      )
                    "
                  >
                    {{
                      formatSeverity(
                        finding.severity
                      )
                    }}
                  </span>
                </div>

                <strong class="finding-title">
                  {{
                    finding.rule ||
                    finding.advisory?.title ||
                    '検出項目'
                  }}
                </strong>

                <p class="finding-message">
                  {{
                    finding.message ||
                    finding.advisory
                      ?.description ||
                    '詳細情報なし'
                  }}
                </p>

                <div class="finding-meta">
                  <span
                    v-if="finding.file"
                  >
                    {{ finding.file }}
                  </span>

                  <span
                    v-if="finding.line"
                  >
                    LINE {{ finding.line }}
                  </span>

                  <span
                    v-if="finding.column"
                  >
                    COL {{ finding.column }}
                  </span>

                  <span
                    v-if="finding.gem"
                  >
                    {{ finding.gem }}
                  </span>
                </div>
              </div>

              <span class="finding-arrow">
                →
              </span>
            </button>
          </div>
        </div>
      </Transition>
    </section>

    <section class="panel history-panel page-enter delay-5">
      <div class="panel-header">
        <div>
          <p class="panel-eyebrow">
            SCAN HISTORY
          </p>
          <h2>
            スキャン履歴
          </h2>
          <p class="panel-description">
            任意の履歴をクリックすると、そのScanRunの詳細を表示します
          </p>
        </div>

        <span class="history-period">
          LAST {{ scanHistory.length }} RUNS
        </span>
      </div>

      <div
        v-if="scanHistory.length === 0"
        class="empty-state"
      >
        <div class="empty-icon">
          ◌
        </div>
        <strong>
          スキャン履歴がありません
        </strong>
        <span>
          SCAN HISTORY / EMPTY
        </span>
      </div>

      <div
        v-else
        class="history-list"
      >
        <button
          v-for="scan in scanHistory"
          :key="scan.id"
          type="button"
          class="history-row"
          @click="
            openHistoryDetail(scan)
          "
        >
          <span class="history-scan-line"></span>

          <div class="history-id">
            #{{ scan.id }}
          </div>

          <div class="history-main">
            <div class="history-title-row">
              <strong
                :class="
                  statusTextClass(
                    scan.status
                  )
                "
              >
                {{
                  formatStatus(
                    scan.status
                  )
                }}
              </strong>

              <span>
                {{
                  formatDateTime(
                    scan.created_at
                  )
                }}
              </span>
            </div>

            <div class="history-summary">
              <span>
                CODE
                {{
                  getSummaryValue(
                    scan,
                    'code_quality'
                  )
                }}
              </span>

              <span>
                SECURITY
                {{
                  getSummaryValue(
                    scan,
                    'security'
                  )
                }}
              </span>

              <span>
                DEPENDENCIES
                {{
                  getSummaryValue(
                    scan,
                    'dependencies'
                  )
                }}
              </span>
            </div>
          </div>

          <div class="history-duration">
            {{
              formatDuration(
                scan.duration_ms
              )
            }}
          </div>

          <span class="history-arrow">
            →
          </span>
        </button>
      </div>
    </section>

    <Transition name="floating-error">
      <div
        v-if="loadError"
        class="floating-error"
      >
        <span>!</span>
        {{ loadError }}
      </div>
    </Transition>
  </div>

  <Teleport to="body">
    <Transition name="scanner-modal">
      <div
        v-if="showFindingModal"
        class="scanner-modal-backdrop"
        @click.self="
          closeFindingModal
        "
      >
        <div class="scanner-modal">
          <div class="scanner-modal-header">
            <div>
              <p class="modal-eyebrow">
                FINDING DETAIL
              </p>

              <h2>
                検出結果詳細
              </h2>

              <span
                v-if="selectedFinding"
                class="modal-subtitle"
              >
                {{
                  selectedFinding.tool.toUpperCase()
                }}
              </span>
            </div>

            <button
              type="button"
              class="modal-close"
              @click="
                closeFindingModal
              "
            >
              ×
            </button>
          </div>

          <div
            v-if="selectedFinding"
            class="scanner-modal-body"
          >
            <div class="modal-status-row">
              <span
                class="finding-severity large"
                :class="
                  severityClass(
                    selectedFinding.severity
                  )
                "
              >
                {{
                  formatSeverity(
                    selectedFinding.severity
                  )
                }}
              </span>

              <span class="modal-tool">
                {{
                  selectedFinding.tool.toUpperCase()
                }}
              </span>
            </div>

            <section class="modal-section">
              <p class="modal-section-label">
                DETECTION
              </p>

              <h3>
                {{
                  selectedFinding.rule ||
                  selectedFinding.advisory
                    ?.title ||
                  '検出された問題'
                }}
              </h3>

              <p class="modal-description">
                {{
                  selectedFinding.message ||
                  selectedFinding.advisory
                    ?.description ||
                  '詳細な説明はありません。'
                }}
              </p>
            </section>

            <section class="modal-grid">
              <div
                v-if="selectedFinding.file"
                class="modal-data"
              >
                <span>
                  FILE
                </span>

                <strong class="mono wrap">
                  {{
                    selectedFinding.file
                  }}
                </strong>
              </div>

              <div
                v-if="selectedFinding.line"
                class="modal-data"
              >
                <span>
                  LINE
                </span>

                <strong class="mono">
                  {{
                    selectedFinding.line
                  }}
                </strong>
              </div>

              <div
                v-if="selectedFinding.column"
                class="modal-data"
              >
                <span>
                  COLUMN
                </span>

                <strong class="mono">
                  {{
                    selectedFinding.column
                  }}
                </strong>
              </div>

              <div
                v-if="selectedFinding.rule"
                class="modal-data"
              >
                <span>
                  RULE
                </span>

                <strong class="mono wrap">
                  {{
                    selectedFinding.rule
                  }}
                </strong>
              </div>

              <div
                v-if="selectedFinding.gem"
                class="modal-data"
              >
                <span>
                  GEM
                </span>

                <strong class="mono">
                  {{
                    selectedFinding.gem
                  }}
                </strong>
              </div>

              <div
                v-if="selectedFinding.version"
                class="modal-data"
              >
                <span>
                  VERSION
                </span>

                <strong class="mono">
                  {{
                    selectedFinding.version
                  }}
                </strong>
              </div>

              <div
                v-if="
                  selectedFinding.advisory?.id
                "
                class="modal-data"
              >
                <span>
                  ADVISORY ID
                </span>

                <strong class="mono wrap">
                  {{
                    selectedFinding.advisory.id
                  }}
                </strong>
              </div>

              <div
                v-if="
                  selectedFinding.advisory?.cve
                "
                class="modal-data"
              >
                <span>
                  CVE
                </span>

                <strong class="mono">
                  {{
                    selectedFinding.advisory.cve
                  }}
                </strong>
              </div>

              <div
                v-if="
                  selectedFinding.advisory?.ghsa
                "
                class="modal-data"
              >
                <span>
                  GHSA
                </span>

                <strong class="mono">
                  {{
                    selectedFinding.advisory.ghsa
                  }}
                </strong>
              </div>

              <div
                v-if="
                  selectedFinding.advisory?.date
                "
                class="modal-data"
              >
                <span>
                  DATE
                </span>

                <strong class="mono">
                  {{
                    selectedFinding.advisory.date
                  }}
                </strong>
              </div>
            </section>

            <section
              v-if="
                selectedFinding
                  .advisory
                  ?.patched_versions
                  ?.length
              "
              class="modal-section"
            >
              <p class="modal-section-label">
                PATCHED VERSIONS
              </p>

              <div class="modal-tag-list">
                <span
                  v-for="version in selectedFinding.advisory.patched_versions"
                  :key="version"
                  class="modal-tag"
                >
                  {{ version }}
                </span>
              </div>
            </section>

            <section
              v-if="
                selectedFinding
                  .advisory
                  ?.unaffected_versions
                  ?.length
              "
              class="modal-section"
            >
              <p class="modal-section-label">
                UNAFFECTED VERSIONS
              </p>

              <div class="modal-tag-list">
                <span
                  v-for="version in selectedFinding.advisory.unaffected_versions"
                  :key="version"
                  class="modal-tag muted"
                >
                  {{ version }}
                </span>
              </div>
            </section>

            <section
              v-if="
                selectedFinding.advisory?.url
              "
              class="modal-section"
            >
              <p class="modal-section-label">
                ADVISORY URL
              </p>

              <a
                :href="
                  selectedFinding.advisory.url
                "
                target="_blank"
                rel="noopener noreferrer"
                class="modal-link"
              >
                {{
                  selectedFinding.advisory.url
                }}
              </a>
            </section>

            <details class="modal-raw">
              <summary>
                RAW FINDING DATA
              </summary>

              <pre>{{
                JSON.stringify(
                  selectedFinding,
                  null,
                  2
                )
              }}</pre>
            </details>
          </div>

          <div class="scanner-modal-footer">
            <span>
              SCAN RESULT / DETAIL
            </span>

            <button
              type="button"
              class="modal-close-button"
              @click="
                closeFindingModal
              "
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="scanner-modal">
      <div
        v-if="showHistoryModal"
        class="scanner-modal-backdrop"
        @click.self="
          closeHistoryModal
        "
      >
        <div class="scanner-modal history-detail-modal">
          <div class="scanner-modal-header">
            <div>
              <p class="modal-eyebrow">
                SCAN HISTORY DETAIL
              </p>

              <h2>
                スキャン履歴詳細
              </h2>

              <span
                v-if="selectedHistoryScan"
                class="modal-subtitle"
              >
                SCAN #{{ selectedHistoryScan.id }}
              </span>
            </div>

            <button
              type="button"
              class="modal-close"
              @click="
                closeHistoryModal
              "
            >
              ×
            </button>
          </div>

          <div
            v-if="isLoadingHistoryDetail"
            class="history-modal-loading"
          >
            <div class="loading-spinner"></div>

            <strong>
              スキャン詳細を取得しています
            </strong>

            <span>
              SCAN HISTORY / LOADING
            </span>
          </div>

          <div
            v-else-if="selectedHistoryScan"
            class="scanner-modal-body"
          >
            <div class="history-detail-status">
              <div>
                <span class="modal-section-label">
                  STATUS
                </span>

                <strong
                  :class="
                    statusTextClass(
                      selectedHistoryScan.status
                    )
                  "
                >
                  {{
                    formatStatus(
                      selectedHistoryScan.status
                    )
                  }}
                </strong>
              </div>

              <div>
                <span class="modal-section-label">
                  CREATED
                </span>

                <strong>
                  {{
                    formatDateTime(
                      selectedHistoryScan.created_at
                    )
                  }}
                </strong>
              </div>

              <div>
                <span class="modal-section-label">
                  DURATION
                </span>

                <strong>
                  {{
                    formatDuration(
                      selectedHistoryScan.duration_ms
                    )
                  }}
                </strong>
              </div>
            </div>

            <section class="modal-section">
              <p class="modal-section-label">
                SUMMARY
              </p>

              <div class="history-summary-grid">
                <div class="history-summary-card">
                  <span>
                    CODE QUALITY
                  </span>

                  <strong>
                    {{
                      getSummaryValue(
                        selectedHistoryScan,
                        'code_quality'
                      )
                    }}
                  </strong>
                </div>

                <div class="history-summary-card">
                  <span>
                    SECURITY
                  </span>

                  <strong>
                    {{
                      getSummaryValue(
                        selectedHistoryScan,
                        'security'
                      )
                    }}
                  </strong>
                </div>

                <div class="history-summary-card">
                  <span>
                    DEPENDENCIES
                  </span>

                  <strong>
                    {{
                      getSummaryValue(
                        selectedHistoryScan,
                        'dependencies'
                      )
                    }}
                  </strong>
                </div>
              </div>
            </section>

            <section class="modal-section">
              <p class="modal-section-label">
                SEVERITY DISTRIBUTION
              </p>

              <div class="history-severity-grid">
                <div class="severity-card high">
                  <span>
                    HIGH
                  </span>

                  <strong>
                    {{
                      selectedHistorySeverityCounts.high
                    }}
                  </strong>

                  <small>
                    HIGH SEVERITY
                  </small>
                </div>

                <div class="severity-card medium">
                  <span>
                    MEDIUM
                  </span>

                  <strong>
                    {{
                      selectedHistorySeverityCounts.medium
                    }}
                  </strong>

                  <small>
                    MEDIUM SEVERITY
                  </small>
                </div>

                <div class="severity-card low">
                  <span>
                    LOW
                  </span>

                  <strong>
                    {{
                      selectedHistorySeverityCounts.low
                    }}
                  </strong>

                  <small>
                    LOW SEVERITY
                  </small>
                </div>
              </div>
            </section>

            <section class="modal-section">
              <p class="modal-section-label">
                TOOL RESULTS
              </p>

              <div class="history-tool-list">
                <div
                  v-if="
                    hasToolSummary(
                      selectedHistoryScan,
                      'rubocop'
                    )
                  "
                  class="history-tool-card"
                >
                  <div>
                    <strong>
                      RuboCop
                    </strong>
                    <span>
                      CODE QUALITY
                    </span>
                  </div>

                  <strong>
                    {{
                      getToolSummaryNumber(
                        selectedHistoryScan,
                        'rubocop',
                        'offenses'
                      )
                    }}
                  </strong>
                </div>

                <div
                  v-if="
                    hasToolSummary(
                      selectedHistoryScan,
                      'brakeman'
                    )
                  "
                  class="history-tool-card"
                >
                  <div>
                    <strong>
                      Brakeman
                    </strong>
                    <span>
                      SECURITY
                    </span>
                  </div>

                  <strong>
                    {{
                      getToolSummaryNumber(
                        selectedHistoryScan,
                        'brakeman',
                        'warnings'
                      )
                    }}
                  </strong>
                </div>

                <div
                  v-if="
                    hasToolSummary(
                      selectedHistoryScan,
                      'bundler_audit'
                    )
                  "
                  class="history-tool-card"
                >
                  <div>
                    <strong>
                      Bundler Audit
                    </strong>
                    <span>
                      DEPENDENCIES
                    </span>
                  </div>

                  <strong>
                    {{
                      getToolSummaryNumber(
                        selectedHistoryScan,
                        'bundler_audit',
                        'vulnerabilities'
                      )
                    }}
                  </strong>
                </div>
              </div>
            </section>

            <section
              v-if="
                selectedHistoryScan.error_message
              "
              class="modal-section history-error-section"
            >
              <p class="modal-section-label">
                ERROR
              </p>

              <pre>{{
                selectedHistoryScan.error_message
              }}</pre>
            </section>

            <details
              v-if="
                selectedHistoryScan.results
              "
              class="modal-raw"
            >
              <summary>
                RAW SCAN RESULT
              </summary>

              <pre>{{
                JSON.stringify(
                  selectedHistoryScan.results,
                  null,
                  2
                )
              }}</pre>
            </details>
          </div>

          <div class="scanner-modal-footer">
            <span>
              SCAN HISTORY / DETAIL
            </span>

            <button
              type="button"
              class="modal-close-button"
              @click="
                closeHistoryModal
              "
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'

definePageMeta({
  layout: 'admin'
})

type ScanStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'

type ToolKey =
  | 'rubocop'
  | 'brakeman'
  | 'bundler_audit'

type FindingTool =
  | 'rubocop'
  | 'brakeman'
  | 'bundler_audit'

type FindingFilter =
  | 'all'
  | FindingTool

type SummaryKey =
  | 'code_quality'
  | 'security'
  | 'dependencies'

type ToolSummaryKey =
  | 'offenses'
  | 'files'
  | 'warnings'
  | 'errors'
  | 'vulnerabilities'
  | 'affected_gems'
  | 'high'
  | 'medium'
  | 'low'

interface Advisory {
  id?: string | null
  title?: string | null
  url?: string | null
  cve?: string | null
  ghsa?: string | null
  date?: string | null
  description?: string | null
  patched_versions?: string[]
  unaffected_versions?: string[]
  criticality?: string | null
  [key: string]: unknown
}

interface ScanFinding {
  tool: FindingTool
  file?: string | null
  line?: number | null
  column?: number | null
  rule?: string | null
  message?: string | null
  severity?: string | null
  gem?: string | null
  version?: string | null
  criticality?: string | null
  advisory?: Advisory | null
  [key: string]: unknown
}

interface ToolSummary {
  offenses?: number
  files?: number
  warnings?: number
  errors?: number
  vulnerabilities?: number
  affected_gems?: number
  high?: number
  medium?: number
  low?: number
  [key: string]: unknown
}

interface ToolResult {
  status?: string
  stderr?: string
  stdout?: string
  summary?: ToolSummary
  findings?: ScanFinding[]
  exit_code?: number
  duration_ms?: number
  [key: string]: unknown
}

interface ScanSummary {
  rubocop?: ToolSummary
  brakeman?: ToolSummary
  bundler_audit?: ToolSummary
  totals?: {
    code_quality?: number
    security?: number
    dependencies?: number
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface ScanResults {
  rubocop?: ToolResult
  brakeman?: ToolResult
  bundler_audit?: ToolResult
  [key: string]: unknown
}

interface ScanRun {
  id: number
  status: ScanStatus
  started_at?: string | null
  finished_at?: string | null
  duration_ms?: number | null
  summary?: ScanSummary | null
  results?: ScanResults | null
  error_message?: string | null
  triggered_by?: number | null
  created_at?: string | null
}

interface ToolCard {
  key: ToolKey
  code: string
  label: string
  description: string
  status: string
  statusLabel: string
  primaryLabel: string
  primaryValue: number
  secondaryLabel: string
  secondaryValue: number
  duration: number | null
}

interface PipelineTool {
  key: ToolKey
  label: string
  description: string
  status:
    | 'completed'
    | 'running'
    | 'failed'
    | 'waiting'
  statusLabel: string
  hasConnector: boolean
  connectorActive: boolean
}

interface SeverityCounts {
  high: number
  medium: number
  low: number
}

const { $api } = useNuxtApp()

const scanHistory = ref<ScanRun[]>([])
const currentScan = ref<ScanRun | null>(null)
const isLoading = ref(false)
const isRefreshing = ref(false)
const isScanning = ref(false)
const loadError = ref('')

const findingSearch = ref('')
const findingToolFilter =
  ref<FindingFilter>('all')

const showFindings = ref(false)
const showFindingModal = ref(false)
const selectedFinding =
  ref<ScanFinding | null>(null)

const showHistoryModal = ref(false)
const selectedHistoryScan =
  ref<ScanRun | null>(null)

const isLoadingHistoryDetail =
  ref(false)

let pollTimer:
  ReturnType<typeof setInterval> | null =
  null

const formatStatus = (
  status?: string | null
) => {
  if (status === 'queued') {
    return 'QUEUED'
  }

  if (status === 'running') {
    return 'RUNNING'
  }

  if (status === 'completed') {
    return 'COMPLETED'
  }

  if (status === 'failed') {
    return 'FAILED'
  }

  return 'UNKNOWN'
}

const statusTextClass = (
  status?: string | null
) => {
  if (status === 'completed') {
    return 'status-completed'
  }

  if (status === 'running') {
    return 'status-running'
  }

  if (status === 'queued') {
    return 'status-queued'
  }

  if (status === 'failed') {
    return 'status-failed'
  }

  return ''
}

const formatSeverity = (
  severity?: string | null
) => {
  if (!severity) {
    return 'INFO'
  }

  const value =
    severity.toLowerCase()

  if (
    value === 'critical' ||
    value === 'fatal' ||
    value === 'blocker' ||
    value === 'high' ||
    value === 'error'
  ) {
    return 'HIGH'
  }

  if (
    value === 'medium' ||
    value === 'warning'
  ) {
    return 'MEDIUM'
  }

  if (
    value === 'low' ||
    value === 'convention' ||
    value === 'refactor' ||
    value === 'info' ||
    value === 'notice'
  ) {
    return 'LOW'
  }

  return severity.toUpperCase()
}

const normalizeSeverity = (
  severity?: string | null
) => {
  if (!severity) {
    return null
  }

  const value =
    severity.toLowerCase()

  if (
    value === 'critical' ||
    value === 'fatal' ||
    value === 'blocker' ||
    value === 'high' ||
    value === 'error'
  ) {
    return 'high' as const
  }

  if (
    value === 'medium' ||
    value === 'warning'
  ) {
    return 'medium' as const
  }

  if (
    value === 'low' ||
    value === 'convention' ||
    value === 'refactor' ||
    value === 'info' ||
    value === 'notice'
  ) {
    return 'low' as const
  }

  return null
}

const severityClass = (
  severity?: string | null
) => {
  const normalized =
    normalizeSeverity(
      severity
    )

  if (normalized === 'high') {
    return 'high'
  }

  if (normalized === 'medium') {
    return 'medium'
  }

  return 'low'
}

const formatDuration = (
  duration?: number | null
) => {
  if (
    duration === null ||
    duration === undefined ||
    !Number.isFinite(duration)
  ) {
    return '--'
  }

  if (duration < 1000) {
    return `${duration} ms`
  }

  return `${(
    duration / 1000
  ).toFixed(2)} s`
}

const formatDateTime = (
  value?: string | null
) => {
  if (!value) {
    return '--'
  }

  const date = new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '--'
  }

  return date.toLocaleString(
    'ja-JP',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
  )
}

const scannerStatusClass =
  computed(() => {
    if (isScanning.value) {
      return 'running'
    }

    if (
      currentScan.value
        ?.status === 'failed'
    ) {
      return 'failed'
    }

    if (
      currentScan.value
        ?.status === 'completed'
    ) {
      return 'completed'
    }

    return 'ready'
  })

const scannerStatusLabel =
  computed(() => {
    if (isScanning.value) {
      return 'SCANNER RUNNING'
    }

    if (
      currentScan.value
        ?.status === 'failed'
    ) {
      return 'SCANNER ERROR'
    }

    return 'SCANNER READY'
  })

const scannerStatusMessage =
  computed(() => {
    if (isScanning.value) {
      return '現在コード解析を実行しています。'
    }

    if (
      currentScan.value
        ?.status === 'failed'
    ) {
      return '前回のスキャンでエラーが発生しました。'
    }

    if (
      currentScan.value
        ?.status === 'completed'
    ) {
      return '最新のスキャン結果を表示しています。'
    }

    return 'スキャンエンジンは実行可能です。'
  })

const formattedLastCheck =
  computed(() => {
    if (!currentScan.value) {
      return '--'
    }

    return formatDateTime(
      currentScan.value
        .finished_at ||
        currentScan.value
          .created_at
    )
  })

const totalCodeQuality =
  computed(() => {
    return (
      currentScan.value
        ?.summary?.totals
        ?.code_quality ??
      currentScan.value
        ?.summary?.rubocop
        ?.offenses ??
      currentScan.value
        ?.results?.rubocop
        ?.summary?.offenses ??
      0
    )
  })

const totalSecurity =
  computed(() => {
    return (
      currentScan.value
        ?.summary?.totals
        ?.security ??
      currentScan.value
        ?.summary?.brakeman
        ?.warnings ??
      currentScan.value
        ?.results?.brakeman
        ?.summary?.warnings ??
      0
    )
  })

const totalDependencies =
  computed(() => {
    return (
      currentScan.value
        ?.summary?.totals
        ?.dependencies ??
      currentScan.value
        ?.summary?.bundler_audit
        ?.vulnerabilities ??
      currentScan.value
        ?.results
        ?.bundler_audit
        ?.summary
        ?.vulnerabilities ??
      0
    )
  })

const inspectedFiles =
  computed(() => {
    return (
      currentScan.value
        ?.summary?.rubocop
        ?.files ??
      currentScan.value
        ?.results?.rubocop
        ?.summary?.files ??
      0
    )
  })

const collectFindings = (
  scan: ScanRun | null
) => {
  if (!scan?.results) {
    return []
  }

  const findings: ScanFinding[] =
    []

  const tools: FindingTool[] = [
    'brakeman',
    'bundler_audit',
    'rubocop'
  ]

  for (const tool of tools) {
    const toolFindings =
      scan.results[tool]
        ?.findings ?? []

    for (
      const finding
      of toolFindings
    ) {
      findings.push({
        ...finding,
        tool
      })
    }
  }

  return findings
}

const allFindings =
  computed<ScanFinding[]>(() => {
    const findings =
      collectFindings(
        currentScan.value
      )

    return findings.sort(
      (a, b) => {
        const order: Record<
          string,
          number
        > = {
          critical: 0,
          fatal: 0,
          blocker: 0,
          high: 0,
          error: 0,
          medium: 1,
          warning: 1,
          low: 2,
          info: 2,
          notice: 2,
          convention: 2,
          refactor: 2
        }

        const aOrder =
          order[
            String(
              a.severity
            ).toLowerCase()
          ] ?? 3

        const bOrder =
          order[
            String(
              b.severity
            ).toLowerCase()
          ] ?? 3

        if (
          aOrder !==
          bOrder
        ) {
          return (
            aOrder -
            bOrder
          )
        }

        return a.tool.localeCompare(
          b.tool
        )
      }
    )
  })

const filteredFindings =
  computed(() => {
    const keyword =
      findingSearch.value
        .trim()
        .toLowerCase()

    return allFindings.value.filter(
      finding => {
        const matchesTool =
          findingToolFilter.value ===
            'all' ||
          finding.tool ===
            findingToolFilter.value

        const searchable = [
          finding.file,
          finding.rule,
          finding.message,
          finding.gem,
          finding.version,
          finding.advisory?.id,
          finding.advisory?.title,
          finding.advisory?.cve,
          finding.advisory?.ghsa
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        const matchesSearch =
          !keyword ||
          searchable.includes(
            keyword
          )

        return (
          matchesTool &&
          matchesSearch
        )
      }
    )
  })

const calculateSeverityCounts = (
  scan: ScanRun | null
): SeverityCounts => {
  const counts: SeverityCounts = {
    high: 0,
    medium: 0,
    low: 0
  }

  if (!scan) {
    return counts
  }

  const rubocopFindings =
    scan.results
      ?.rubocop
      ?.findings ?? []

  for (
    const finding
    of rubocopFindings
  ) {
    const normalized =
      normalizeSeverity(
        finding.severity
      )

    if (!normalized) {
      continue
    }

    counts[normalized] += 1
  }

  const brakemanFindings =
    scan.results
      ?.brakeman
      ?.findings ?? []

  for (
    const finding
    of brakemanFindings
  ) {
    const normalized =
      normalizeSeverity(
        finding.severity ??
        finding.criticality ??
        finding.advisory
          ?.criticality
      )

    if (!normalized) {
      continue
    }

    counts[normalized] += 1
  }

  const bundlerSummary =
    scan.results
      ?.bundler_audit
      ?.summary ??
    scan.summary
      ?.bundler_audit

  if (bundlerSummary) {
    counts.high +=
      typeof bundlerSummary.high ===
      'number'
        ? bundlerSummary.high
        : 0

    counts.medium +=
      typeof bundlerSummary.medium ===
      'number'
        ? bundlerSummary.medium
        : 0

    counts.low +=
      typeof bundlerSummary.low ===
      'number'
        ? bundlerSummary.low
        : 0
  }

  return counts
}

const severityCounts =
  computed<SeverityCounts>(() => {
    return calculateSeverityCounts(
      currentScan.value
    )
  })

const selectedHistorySeverityCounts =
  computed<SeverityCounts>(() => {
    return calculateSeverityCounts(
      selectedHistoryScan.value
    )
  })

const getToolStatusLabel = (
  status?: string
) => {
  if (
    status === 'completed' ||
    status === 'success' ||
    status === 'warning'
  ) {
    return 'COMPLETED'
  }

  if (status === 'running') {
    return 'RUNNING'
  }

  if (
    status === 'error' ||
    status === 'failed'
  ) {
    return 'FAILED'
  }

  return 'WAITING'
}

const normalizePipelineStatus = (
  status?: string
) => {
  if (
    status === 'completed' ||
    status === 'success' ||
    status === 'warning'
  ) {
    return 'completed' as const
  }

  if (status === 'running') {
    return 'running' as const
  }

  if (
    status === 'error' ||
    status === 'failed'
  ) {
    return 'failed' as const
  }

  return 'waiting' as const
}

const toolCards =
  computed<ToolCard[]>(() => {
    const rubocop =
      currentScan.value
        ?.summary?.rubocop

    const brakeman =
      currentScan.value
        ?.summary?.brakeman

    const bundler =
      currentScan.value
        ?.summary?.bundler_audit

    const rubocopResult =
      currentScan.value
        ?.results?.rubocop

    const brakemanResult =
      currentScan.value
        ?.results?.brakeman

    const bundlerResult =
      currentScan.value
        ?.results
        ?.bundler_audit

    return [
      {
        key: 'rubocop',
        code:
          'CODE QUALITY / 01',
        label: 'RuboCop',
        description:
          'Rubyコードのスタイル・品質を検査します。',
        status:
          rubocopResult
            ?.status ??
          'waiting',
        statusLabel:
          getToolStatusLabel(
            rubocopResult?.status
          ),
        primaryLabel:
          'OFFENSES',
        primaryValue:
          rubocop
            ?.offenses ??
          rubocopResult
            ?.summary
            ?.offenses ??
          0,
        secondaryLabel:
          'FILES',
        secondaryValue:
          rubocop?.files ??
          rubocopResult
            ?.summary?.files ??
          0,
        duration:
          rubocopResult
            ?.duration_ms ??
          null
      },
      {
        key: 'brakeman',
        code:
          'SECURITY / 02',
        label: 'Brakeman',
        description:
          'Railsアプリケーションの脆弱性を静的解析します。',
        status:
          brakemanResult
            ?.status ??
          'waiting',
        statusLabel:
          getToolStatusLabel(
            brakemanResult
              ?.status
          ),
        primaryLabel:
          'WARNINGS',
        primaryValue:
          brakeman
            ?.warnings ??
          brakemanResult
            ?.summary
            ?.warnings ??
          0,
        secondaryLabel:
          'ERRORS',
        secondaryValue:
          brakeman
            ?.errors ??
          brakemanResult
            ?.summary
            ?.errors ??
          0,
        duration:
          brakemanResult
            ?.duration_ms ??
          null
      },
      {
        key: 'bundler_audit',
        code:
          'DEPENDENCY SECURITY / 03',
        label:
          'Bundler Audit',
        description:
          'Gem依存関係に既知の脆弱性がないか確認します。',
        status:
          bundlerResult
            ?.status ??
          'waiting',
        statusLabel:
          getToolStatusLabel(
            bundlerResult
              ?.status
          ),
        primaryLabel:
          'VULNERABILITIES',
        primaryValue:
          bundler
            ?.vulnerabilities ??
          bundlerResult
            ?.summary
            ?.vulnerabilities ??
          0,
        secondaryLabel:
          'AFFECTED GEMS',
        secondaryValue:
          bundler
            ?.affected_gems ??
          bundlerResult
            ?.summary
            ?.affected_gems ??
          0,
        duration:
          bundlerResult
            ?.duration_ms ??
          null
      }
    ]
  })

const pipelineTools =
  computed<PipelineTool[]>(() => {
    return toolCards.value.map(
      (
        tool,
        index,
        tools
      ) => {
        const nextTool =
          tools[index + 1]

        const currentStatus =
          normalizePipelineStatus(
            tool.status
          )

        const nextStatus =
          nextTool
            ? normalizePipelineStatus(
                nextTool.status
              )
            : null

        return {
          key: tool.key,
          label: tool.label,
          description:
            tool.description,
          status:
            currentStatus,
          statusLabel:
            tool.statusLabel,
          hasConnector:
            index <
            tools.length - 1,
          connectorActive:
            currentStatus ===
              'completed' ||
            nextStatus ===
              'running' ||
            nextStatus ===
              'completed'
        }
      }
    )
  })

const completedToolCount =
  computed(() => {
    return pipelineTools.value.filter(
      tool =>
        tool.status ===
        'completed'
    ).length
  })

const getSummaryValue = (
  scan: ScanRun,
  key: SummaryKey
) => {
  const totals =
    scan.summary?.totals

  if (
    key === 'code_quality'
  ) {
    return (
      totals?.code_quality ??
      scan.summary
        ?.rubocop?.offenses ??
      0
    )
  }

  if (
    key === 'security'
  ) {
    return (
      totals?.security ??
      scan.summary
        ?.brakeman?.warnings ??
      0
    )
  }

  return (
    totals?.dependencies ??
    scan.summary
      ?.bundler_audit
      ?.vulnerabilities ??
    0
  )
}

const getToolSummary = (
  scan: ScanRun,
  tool: ToolKey
) => {
  if (!scan.summary) {
    return null
  }

  return (
    scan.summary[tool] ??
    null
  )
}

const hasToolSummary = (
  scan: ScanRun,
  tool: ToolKey
) => {
  return (
    getToolSummary(
      scan,
      tool
    ) !== null
  )
}

const getToolSummaryNumber = (
  scan: ScanRun,
  tool: ToolKey,
  key: ToolSummaryKey
) => {
  const summary =
    getToolSummary(
      scan,
      tool
    )

  if (!summary) {
    return 0
  }

  const value =
    summary[key]

  return typeof value ===
    'number'
    ? value
    : 0
}

const mergeScanData = (
  existing: ScanRun | null,
  incoming: ScanRun
): ScanRun => {
  if (!existing) {
    return incoming
  }

  return {
    ...existing,
    ...incoming,
    summary:
      incoming.summary ??
      existing.summary,
    results:
      incoming.results ??
      existing.results,
    error_message:
      incoming.error_message ??
      existing.error_message,
    started_at:
      incoming.started_at ??
      existing.started_at,
    finished_at:
      incoming.finished_at ??
      existing.finished_at,
    duration_ms:
      incoming.duration_ms ??
      existing.duration_ms,
    triggered_by:
      incoming.triggered_by ??
      existing.triggered_by,
    created_at:
      incoming.created_at ??
      existing.created_at
  }
}

const mergeHistoryWithCurrent = (
  history: ScanRun[]
) => {
  return history.map(
    scan => {
      if (
        currentScan.value?.id ===
        scan.id
      ) {
        return mergeScanData(
          currentScan.value,
          scan
        )
      }

      return scan
    }
  )
}

const loadHistory =
  async () => {
    const response =
      await $api.get<ScanRun[]>(
        '/admin/scans'
      )

    const history =
      Array.isArray(
        response.data
      )
        ? response.data
        : []

    scanHistory.value =
      mergeHistoryWithCurrent(
        history
      )

    const activeScan =
      scanHistory.value.find(
        scan =>
          scan.status ===
            'queued' ||
          scan.status ===
            'running'
      )

    if (activeScan) {
      currentScan.value =
        mergeScanData(
          currentScan.value,
          activeScan
        )

      isScanning.value =
        true

      startPolling(
        activeScan.id
      )

      return
    }

    if (
      currentScan.value
    ) {
      const currentId =
        currentScan.value.id

      const latestCurrent =
        scanHistory.value.find(
          scan =>
            scan.id ===
            currentId
        )

      if (latestCurrent) {
        currentScan.value =
          mergeScanData(
            currentScan.value,
            latestCurrent
          )

        return
      }
    }

    const latestScan =
      scanHistory.value[0]

    if (latestScan) {
      currentScan.value =
        latestScan
    } else {
      currentScan.value =
        null
    }
  }

const loadScan =
  async (
    scanId: number
  ) => {
    const response =
      await $api.get<ScanRun>(
        `/admin/scans/${scanId}`
      )

    const scan =
      response.data

    currentScan.value =
      mergeScanData(
        currentScan.value,
        scan
      )

    if (
      scan.status ===
        'queued' ||
      scan.status ===
        'running'
    ) {
      isScanning.value =
        true

      startPolling(
        scan.id
      )
    } else {
      isScanning.value =
        false

      stopPolling()
    }

    return currentScan.value
  }

const startScan =
  async () => {
    if (isScanning.value) {
      return
    }

    isLoading.value =
      true

    loadError.value =
      ''

    try {
      const response =
        await $api.post<ScanRun>(
          '/admin/scans'
        )

      currentScan.value =
        response.data

      isScanning.value =
        response.data.status ===
          'queued' ||
        response.data.status ===
          'running'

      startPolling(
        response.data.id
      )

      await loadHistory()
    } catch (
      error: any
    ) {
      console.error(
        'スキャン開始に失敗しました:',
        error
      )

      if (
        error?.response
          ?.status === 409
      ) {
        loadError.value =
          'スキャンはすでに実行中です。'
      } else {
        loadError.value =
          'スキャンの開始に失敗しました。'
      }
    } finally {
      isLoading.value =
        false
    }
  }

const refreshScanner =
  async () => {
    if (isRefreshing.value) {
      return
    }

    isRefreshing.value =
      true

    loadError.value =
      ''

    try {
      const previousId =
        currentScan.value?.id ??
        null

      await loadHistory()

      const targetId =
        previousId ??
        currentScan.value?.id ??
        scanHistory.value[0]?.id ??
        null

      if (targetId) {
        await loadScan(
          targetId
        )
      }

      await loadHistory()

      if (
        showHistoryModal.value &&
        selectedHistoryScan.value
      ) {
        const historyId =
          selectedHistoryScan.value.id

        const detailResponse =
          await $api.get<ScanRun>(
            `/admin/scans/${historyId}`
          )

        selectedHistoryScan.value =
          detailResponse.data
      }
    } catch (
      error
    ) {
      console.error(
        'スキャン結果の再取得に失敗しました:',
        error
      )

      loadError.value =
        'スキャン結果の再取得に失敗しました。'
    } finally {
      isRefreshing.value =
        false
    }
  }

const startPolling = (
  scanId: number
) => {
  stopPolling()

  pollTimer =
    setInterval(
      async () => {
        try {
          const scan =
            await loadScan(
              scanId
            )

          if (
            scan.status ===
              'completed' ||
            scan.status ===
              'failed'
          ) {
            stopPolling()

            isScanning.value =
              false

            await loadHistory()
          }
        } catch (
          error
        ) {
          console.error(
            'スキャン状態の取得に失敗しました:',
            error
          )
        }
      },
      2000
    )
}

const stopPolling = () => {
  if (!pollTimer) {
    return
  }

  clearInterval(
    pollTimer
  )

  pollTimer = null
}

const openFindingDetail = (
  finding: ScanFinding
) => {
  selectedFinding.value =
    finding

  showFindingModal.value =
    true
}

const closeFindingModal =
  () => {
    showFindingModal.value =
      false

    selectedFinding.value =
      null
  }

const openHistoryDetail =
  async (
    scan: ScanRun
  ) => {
    showHistoryModal.value =
      true

    isLoadingHistoryDetail.value =
      true

    selectedHistoryScan.value =
      scan

    try {
      const response =
        await $api.get<ScanRun>(
          `/admin/scans/${scan.id}`
        )

      selectedHistoryScan.value =
        response.data
    } catch (
      error
    ) {
      console.error(
        'スキャン履歴詳細の取得に失敗しました:',
        error
      )
    } finally {
      isLoadingHistoryDetail.value =
        false
    }
  }

const closeHistoryModal =
  () => {
    showHistoryModal.value =
      false

    selectedHistoryScan.value =
      null
  }

onMounted(
  async () => {
    isLoading.value =
      true

    loadError.value =
      ''

    try {
      await loadHistory()
    } catch (
      error
    ) {
      console.error(
        'スキャン情報の取得に失敗しました:',
        error
      )

      loadError.value =
        'スキャン情報の取得に失敗しました。'
    } finally {
      isLoading.value =
        false
    }
  }
)

onBeforeUnmount(
  () => {
    stopPolling()
  }
)
</script>

<style scoped>
.admin-scanner {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  padding: 32px 30px 48px;
  box-sizing: border-box;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 50% 42%,
      rgba(34, 184, 223, 0.04),
      transparent 30%
    ),
    radial-gradient(
      circle at 86% 6%,
      rgba(34, 184, 223, 0.06),
      transparent 24%
    ),
    #f4f9fc;
  color: #17313d;
}

.ambient-grid {
  position: absolute;
  inset: 0;
  z-index: -3;
  pointer-events: none;
  opacity: 0.55;
  background-image:
    linear-gradient(
      rgba(34, 184, 223, 0.025) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(34, 184, 223, 0.025) 1px,
      transparent 1px
    );
  background-size: 48px 48px;
  animation: grid-drift 18s linear infinite;
}

.ambient-scan {
  position: absolute;
  left: 0;
  right: 0;
  top: -18%;
  height: 18%;
  z-index: -2;
  pointer-events: none;
  opacity: 0.28;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(34, 184, 223, 0.08),
    transparent
  );
  filter: blur(10px);
  animation: ambient-scan 9s linear infinite;
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  width: min(100%, 1450px);
  margin: 0 auto 18px;
}

.eyebrow,
.panel-eyebrow,
.card-eyebrow,
.modal-eyebrow {
  margin: 0 0 7px;
  color: #22a4c9;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.17em;
}

.page-heading h1 {
  margin: 0;
  color: #17313d;
  font-size: 32px;
  line-height: 1.1;
  letter-spacing: 0.03em;
}

.description {
  margin: 8px 0 0;
  color: #6d8792;
  font-size: 13px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.refresh-button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 40px;
  padding: 0 15px;
  border: 1px solid #bdd7df;
  background: rgba(255, 255, 255, 0.88);
  color: #456874;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.refresh-button:hover:not(:disabled) {
  border-color: #22b8df;
  background: #ffffff;
  color: #1d9fbe;
  transform: translateY(-1px);
}

.refresh-button:disabled {
  cursor: wait;
  opacity: 0.62;
}

.refresh-icon {
  display: inline-block;
  font-size: 17px;
  line-height: 1;
}

.refresh-icon.spinning {
  animation: spin 0.8s linear infinite;
}

.status-banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  width: min(100%, 1450px);
  margin: 0 auto 18px;
  padding: 18px 20px;
  border: 1px solid #cfe2e9;
  background: rgba(255, 255, 255, 0.82);
  box-shadow:
    0 12px 30px rgba(43, 89, 107, 0.05),
    0 0 25px rgba(34, 184, 223, 0.035);
  overflow: hidden;
}

.status-banner::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background: #22b8df;
}

.status-banner::after {
  content: "";
  position: absolute;
  left: -20%;
  top: 0;
  width: 20%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 184, 223, 0.06),
    transparent
  );
  animation: banner-scan 4.5s linear infinite;
}

.status-banner-left {
  display: flex;
  align-items: center;
  gap: 13px;
}

.status-indicator {
  display: grid;
  place-items: center;
  width: 25px;
  height: 25px;
  border: 1px solid #b8dae3;
  border-radius: 50%;
  background: #f4fbfd;
}

.status-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22b8df;
  box-shadow: 0 0 12px rgba(34, 184, 223, 0.34);
  animation: status-pulse 1.8s ease-in-out infinite;
}

.status-indicator.completed span {
  background: #31b985;
}

.status-indicator.failed span {
  background: #e56557;
}

.status-label {
  margin: 0 0 3px;
  color: #8aa0a8;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.status-banner-left strong {
  color: #25424d;
  font-size: 17px;
}

.status-message {
  margin: 4px 0 0;
  color: #708994;
  font-size: 10px;
}

.last-check {
  display: grid;
  gap: 4px;
  text-align: right;
}

.last-check span {
  color: #8ca1aa;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.last-check strong {
  color: #456874;
  font-size: 10px;
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  width: min(100%, 1450px);
  margin: 0 auto 14px;
}

.monitor-card {
  position: relative;
  padding: 18px;
  border: 1px solid #cfe2e9;
  background: rgba(255, 255, 255, 0.86);
  box-shadow:
    0 10px 26px rgba(43, 89, 107, 0.045),
    0 0 25px rgba(34, 184, 223, 0.025);
  overflow: hidden;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.monitor-card:hover {
  transform: translateY(-2px);
  border-color: #bddbe4;
  box-shadow:
    0 14px 32px rgba(43, 89, 107, 0.08),
    0 0 28px rgba(34, 184, 223, 0.05);
}

.card-scan {
  position: absolute;
  left: 0;
  right: 0;
  top: -1px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 184, 223, 0.7),
    transparent
  );
  animation: card-scan 3.8s linear infinite;
}

.monitor-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.monitor-card-header h2 {
  margin: 0;
  color: #24414d;
  font-size: 17px;
}

.tool-description {
  margin: 9px 0 16px;
  min-height: 34px;
  color: #708994;
  font-size: 10px;
  line-height: 1.7;
}

.state-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border: 1px solid #d7e6ea;
  background: #f8fbfc;
  color: #7a929a;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.09em;
  white-space: nowrap;
}

.state-badge span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #a1b4ba;
}

.state-badge.completed span {
  background: #31b985;
}

.state-badge.running span {
  background: #22b8df;
  animation: status-pulse 1.5s ease-in-out infinite;
}

.state-badge.warning span {
  background: #dcae38;
}

.state-badge.failed span {
  background: #e56557;
}

.tool-readout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.tool-readout > div {
  padding: 11px;
  border: 1px solid #dbe8ec;
  background: #fbfdfe;
}

.tool-readout span {
  display: block;
  margin-bottom: 5px;
  color: #899da5;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.tool-readout strong {
  color: #24414d;
  font-size: 22px;
}

.tool-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 11px;
  padding-top: 10px;
  border-top: 1px solid #e0eaed;
}

.tool-footer span {
  color: #8aa0a8;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.tool-footer strong {
  color: #597782;
  font-size: 9px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  width: min(100%, 1450px);
  margin: 0 auto 18px;
}

.metric-card {
  position: relative;
  padding: 16px 17px;
  border: 1px solid #cfe2e9;
  background: rgba(255, 255, 255, 0.86);
  overflow: hidden;
}

.metric-scan {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 184, 223, 0.55),
    transparent
  );
  animation: card-scan 4.5s linear infinite;
}

.metric-label {
  display: block;
  color: #22a4c9;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.metric-card strong {
  display: block;
  margin-top: 6px;
  color: #17313d;
  font-size: 29px;
  line-height: 1;
}

.metric-card small {
  display: block;
  margin-top: 8px;
  color: #8ba0a8;
  font-size: 8px;
  letter-spacing: 0.08em;
}

.panel {
  position: relative;
  width: min(100%, 1450px);
  margin: 0 auto 18px;
  padding: 18px;
  box-sizing: border-box;
  border: 1px solid #cfe2e9;
  background: rgba(255, 255, 255, 0.85);
  box-shadow:
    0 12px 28px rgba(43, 89, 107, 0.045),
    0 0 24px rgba(34, 184, 223, 0.025);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}

.panel-header h2 {
  margin: 0;
  color: #1d3945;
  font-size: 17px;
}

.panel-description {
  margin: 6px 0 0;
  color: #738b95;
  font-size: 10px;
}

.panel-live,
.pipeline-count,
.history-period,
.finding-header-meta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #5d7a85;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.11em;
}

.panel-live span,
.result-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #31b985;
  box-shadow: 0 0 9px rgba(49, 185, 133, 0.22);
  animation: status-pulse 1.8s ease-in-out infinite;
}

.history-period {
  padding: 6px 8px;
  border: 1px solid #d7e6ea;
  background: #f8fbfc;
}

.scan-control-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 15px;
  border: 1px solid #d9e7eb;
  background: #fbfdfe;
}

.scan-control-copy {
  min-width: 0;
}

.scan-control-copy strong {
  color: #294752;
  font-size: 12px;
}

.scan-control-copy p {
  margin: 5px 0 0;
  color: #78909a;
  font-size: 10px;
  line-height: 1.7;
}

.run-scan-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-width: 145px;
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid #9bcedb;
  background: #eef9fc;
  color: #1c9dbd;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}

.run-scan-button:hover:not(:disabled) {
  border-color: #22b8df;
  background: #e6f7fb;
  transform: translateY(-1px);
}

.run-scan-button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.run-scan-icon {
  font-size: 12px;
}

.run-scan-icon.active {
  animation: spin 1.1s linear infinite;
}

.scan-progress {
  margin-top: 14px;
}

.scan-progress-bar {
  position: relative;
  height: 3px;
  overflow: hidden;
  background: #e6eff2;
}

.scan-progress-bar span {
  display: block;
  width: 22%;
  height: 100%;
  background: #22b8df;
  transform: translateX(-120%);
}

.scan-progress-bar.active span {
  animation: progress-flow 1.5s linear infinite;
}

.scan-progress-meta {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-top: 7px;
}

.scan-progress-meta span,
.scan-progress-meta strong {
  color: #8ba0a8;
  font-size: 8px;
  letter-spacing: 0.1em;
}

.scan-progress-meta strong {
  color: #5b7883;
}

.pipeline {
  display: flex;
  align-items: stretch;
  gap: 10px;
}

.pipeline-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.pipeline-node {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  border: 1px solid #bfd8df;
  border-radius: 50%;
  background: #f5fbfd;
  color: #5d7c87;
  font-size: 9px;
  font-weight: 800;
}

.pipeline-content {
  min-width: 0;
  padding: 1px 10px 0;
}

.pipeline-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.pipeline-title-row strong {
  color: #294752;
  font-size: 11px;
}

.pipeline-content > span {
  display: block;
  margin-top: 4px;
  color: #80959e;
  font-size: 8px;
  line-height: 1.6;
}

.pipeline-status {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.pipeline-status.completed {
  color: #31a978;
}

.pipeline-status.running {
  color: #1aa5c7;
}

.pipeline-status.failed {
  color: #db675a;
}

.pipeline-status.waiting {
  color: #90a4ab;
}

.pipeline-line {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 20px;
  margin-top: 14px;
}

.pipeline-line::before {
  content: "";
  width: 100%;
  height: 1px;
  background: #d6e4e8;
}

.detail-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1fr);
  gap: 14px;
  width: min(100%, 1450px);
  margin: 0 auto 18px;
}

.detail-grid .panel {
  width: 100%;
  margin-bottom: 0;
}

.summary-list {
  border-top: 1px solid #dde9ec;
}

.summary-row {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 15px;
  align-items: center;
  min-height: 40px;
  border-bottom: 1px solid #e1eaed;
}

.summary-row > span {
  color: #8ca0a8;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.summary-row > strong {
  color: #476772;
  font-size: 10px;
  text-align: right;
}

.status-completed {
  color: #31a978 !important;
}

.status-running {
  color: #1aa5c7 !important;
}

.status-queued {
  color: #d09f32 !important;
}

.status-failed {
  color: #dc695c !important;
}

.severity-grid,
.history-severity-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.severity-card {
  padding: 14px;
  border: 1px solid #d8e6ea;
  background: #fbfdfe;
}

.severity-card.high {
  border-color: #ead0ca;
}

.severity-card.medium {
  border-color: #eadfc1;
}

.severity-card.low {
  border-color: #d2e3e6;
}

.severity-card span {
  display: block;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.severity-card.high span {
  color: #d85e50;
}

.severity-card.medium span {
  color: #c9992f;
}

.severity-card.low span {
  color: #6a8d97;
}

.severity-card strong {
  display: block;
  margin-top: 8px;
  color: #1f3a46;
  font-size: 28px;
}

.severity-card small {
  display: block;
  margin-top: 5px;
  color: #899da5;
  font-size: 8px;
}

.findings-panel {
  padding-bottom: 20px;
}

.findings-header {
  align-items: flex-start;
}

.findings-toggle {
  margin-bottom: 0;
  cursor: pointer;
  user-select: none;
}

.findings-toggle:hover h2 {
  color: #22a4c9;
}

.findings-header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.findings-toggle-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid #cbdfe5;
  background: #f8fbfc;
  color: #6f8a94;
  font-size: 18px;
  font-weight: 400;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.findings-toggle-icon.open {
  transform: rotate(45deg);
  border-color: #9ed2df;
  background: #effafd;
  color: #1f9fbd;
}

.findings-content {
  overflow: hidden;
  padding-top: 16px;
}

.findings-collapse-enter-active,
.findings-collapse-leave-active {
  transition:
    opacity 0.22s ease,
    max-height 0.28s ease,
    transform 0.22s ease;
}

.findings-collapse-enter-from,
.findings-collapse-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.findings-collapse-enter-to,
.findings-collapse-leave-from {
  opacity: 1;
  max-height: 5000px;
  transform: translateY(0);
}

.finding-header-meta {
  color: #6f8a94;
}

.finding-header-meta .result-dot {
  background: #22b8df;
  box-shadow:
    0 0 9px rgba(34, 184, 223, 0.22);
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.filter-group {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.filter-group button {
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid #d1e0e4;
  background: #f9fcfd;
  color: #6c858e;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.09em;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    color 0.18s ease,
    background 0.18s ease;
}

.filter-group button:hover,
.filter-group button.active {
  border-color: #9ed2df;
  background: #effafd;
  color: #1f9fbd;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 260px;
  padding: 0 10px;
  border: 1px solid #d5e3e7;
  background: #fbfdfe;
}

.search-box > span {
  color: #94a8ae;
  font-size: 14px;
}

.search-box input {
  width: 100%;
  min-height: 32px;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #476772;
  font-size: 10px;
}

.search-box input::placeholder {
  color: #9dafb4;
}

.finding-list,
.history-list {
  display: grid;
  gap: 7px;
}

.finding-row {
  position: relative;
  display: grid;
  grid-template-columns:
    28px minmax(0, 1fr) auto;
  align-items: start;
  gap: 12px;
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #d4e3e7;
  background: rgba(255, 255, 255, 0.82);
  color: inherit;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.finding-row:hover {
  transform: translateY(-2px);
  border-color: #9dd1de;
  background: #ffffff;
  box-shadow:
    0 10px 25px rgba(43, 89, 107, 0.07),
    0 0 24px rgba(34, 184, 223, 0.04);
}

.finding-row.high {
  border-left: 2px solid #df6a5c;
}

.finding-row.medium {
  border-left: 2px solid #d5a83c;
}

.finding-row.low {
  border-left: 2px solid #8baeb7;
}

.finding-scan,
.history-scan-line {
  position: absolute;
  left: -20%;
  top: 0;
  width: 20%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(34, 184, 223, 0.5),
    transparent
  );
  animation: finding-scan 4.6s linear infinite;
}

.finding-marker {
  display: grid;
  place-items: center;
  width: 25px;
  height: 25px;
  border: 1px solid #d6e5e9;
  background: #f8fbfc;
  color: #77919b;
  font-size: 8px;
  font-weight: 800;
}

.finding-main {
  min-width: 0;
}

.finding-top {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 5px;
}

.finding-tool {
  color: #6f8a94;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.finding-severity {
  display: inline-flex;
  align-items: center;
  padding: 4px 7px;
  border: 1px solid #dae7ea;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.finding-severity.high {
  border-color: #ecd1cb;
  background: #fff9f7;
  color: #d85f51;
}

.finding-severity.medium {
  border-color: #eadfc2;
  background: #fffdf6;
  color: #c6942a;
}

.finding-severity.low {
  border-color: #d4e4e7;
  background: #f9fcfd;
  color: #698b95;
}

.finding-title {
  display: block;
  color: #294752;
  font-size: 12px;
  line-height: 1.5;
}

.finding-message {
  margin: 4px 0 0;
  color: #748b94;
  font-size: 10px;
  line-height: 1.7;
}

.finding-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 7px;
}

.finding-meta span {
  color: #8a9ea5;
  font-family:
    "SFMono-Regular",
    Consolas,
    "Liberation Mono",
    monospace;
  font-size: 8px;
}

.finding-arrow,
.history-arrow {
  align-self: center;
  color: #22a4c9;
  font-size: 18px;
  transition: transform 0.18s ease;
}

.finding-row:hover .finding-arrow,
.history-row:hover .history-arrow {
  transform: translateX(4px);
}

.history-row {
  position: relative;
  display: grid;
  grid-template-columns:
    56px minmax(0, 1fr) 85px auto;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 13px 14px;
  border: 1px solid #d4e3e7;
  background: rgba(255, 255, 255, 0.82);
  color: inherit;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.history-row:hover {
  transform: translateY(-2px);
  border-color: #9dd1de;
  background: #ffffff;
  box-shadow:
    0 10px 25px rgba(43, 89, 107, 0.07),
    0 0 24px rgba(34, 184, 223, 0.04);
}

.history-id {
  color: #22a4c9;
  font-family:
    "SFMono-Regular",
    Consolas,
    "Liberation Mono",
    monospace;
  font-size: 10px;
  font-weight: 800;
}

.history-main {
  min-width: 0;
}

.history-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.history-title-row strong {
  font-size: 10px;
  letter-spacing: 0.07em;
}

.history-title-row span {
  color: #899da5;
  font-size: 8px;
}

.history-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.history-summary span {
  color: #78919b;
  font-size: 8px;
}

.history-duration {
  color: #567681;
  font-family:
    "SFMono-Regular",
    Consolas,
    "Liberation Mono",
    monospace;
  font-size: 9px;
  text-align: right;
}

.empty-state {
  display: grid;
  place-items: center;
  gap: 8px;
  min-height: 150px;
  border: 1px dashed #d3e1e5;
  background: #fbfdfe;
  text-align: center;
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid #d1e1e5;
  border-radius: 50%;
  color: #7d98a1;
  font-size: 17px;
}

.empty-state strong {
  color: #587680;
  font-size: 11px;
}

.empty-state span {
  color: #96a8ae;
  font-size: 8px;
  letter-spacing: 0.12em;
}

.findings-empty {
  margin-top: 6px;
}

.floating-error {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 100000;
  display: flex;
  align-items: center;
  gap: 9px;
  max-width: 420px;
  padding: 11px 14px;
  border: 1px solid #e3bcb6;
  background: #fff9f7;
  color: #9a5e55;
  box-shadow:
    0 12px 30px rgba(128, 71, 61, 0.08);
  font-size: 10px;
}

.floating-error > span {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border: 1px solid #dca89f;
  border-radius: 50%;
  font-weight: 800;
}

.scanner-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: rgba(18, 38, 47, 0.34);
  backdrop-filter: blur(8px);
}

.scanner-modal {
  position: relative;
  width: min(920px, 100%);
  max-height: calc(100vh - 56px);
  overflow: hidden;
  border: 1px solid #b9d4dd;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.99),
      rgba(247, 251, 253, 0.99)
    );
  box-shadow:
    0 35px 100px rgba(30, 68, 82, 0.24),
    0 0 38px rgba(34, 184, 223, 0.09);
}

.scanner-modal::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    #22b8df,
    transparent
  );
  animation: modal-scan-line 3.2s linear infinite;
}

.scanner-modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 24px 18px;
  border-bottom: 1px solid #d5e5e9;
}

.scanner-modal-header h2 {
  margin: 0;
  color: #17313d;
  font-size: 22px;
  letter-spacing: 0.03em;
}

.modal-subtitle {
  display: block;
  margin-top: 5px;
  color: #718994;
  font-size: 9px;
  letter-spacing: 0.1em;
}

.modal-close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid #c8dde4;
  background: #ffffff;
  color: #66808a;
  font-size: 23px;
  line-height: 1;
  cursor: pointer;
}

.modal-close:hover {
  border-color: #22b8df;
  color: #22a4c9;
}

.scanner-modal-body {
  max-height: calc(100vh - 178px);
  overflow-y: auto;
  padding: 24px;
}

.modal-status-row {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 20px;
}

.finding-severity.large {
  padding: 7px 10px;
  font-size: 8px;
}

.modal-tool {
  padding: 7px 10px;
  border: 1px solid #d5e4e8;
  background: #f8fbfc;
  color: #607c87;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.09em;
}

.modal-section {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #dbe8ec;
}

.modal-section h3 {
  margin: 0;
  color: #294752;
  font-size: 16px;
  line-height: 1.55;
}

.modal-section-label {
  margin: 0 0 6px;
  color: #22a4c9;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.modal-description {
  margin: 9px 0 0;
  color: #617a84;
  font-size: 10px;
  line-height: 1.85;
  white-space: pre-wrap;
}

.modal-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 16px;
}

.modal-data {
  min-width: 0;
  padding: 12px 13px;
  border: 1px solid #d8e6ea;
  background: #fbfdfe;
}

.modal-data > span {
  display: block;
  margin-bottom: 6px;
  color: #869aa2;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.modal-data > strong {
  display: block;
  color: #3d5c67;
  font-size: 9px;
}

.mono {
  font-family:
    "SFMono-Regular",
    Consolas,
    "Liberation Mono",
    monospace;
}

.wrap {
  overflow-wrap: anywhere;
}

.modal-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 8px;
}

.modal-tag {
  padding: 6px 9px;
  border: 1px solid #bfdee6;
  background: #f1fbfd;
  color: #2c7d95;
  font-family:
    "SFMono-Regular",
    Consolas,
    "Liberation Mono",
    monospace;
  font-size: 8px;
}

.modal-tag.muted {
  border-color: #d8e2e6;
  background: #f7f9fa;
  color: #81949b;
}

.modal-link {
  display: block;
  margin-top: 7px;
  color: #1e9dbe;
  font-family:
    "SFMono-Regular",
    Consolas,
    "Liberation Mono",
    monospace;
  font-size: 8px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.modal-raw {
  margin-top: 20px;
  border: 1px solid #d8e6ea;
  background: #f8fbfc;
}

.modal-raw summary {
  padding: 11px 13px;
  color: #617b85;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.11em;
  cursor: pointer;
}

.modal-raw pre {
  max-height: 260px;
  margin: 0;
  padding: 13px;
  overflow: auto;
  border-top: 1px solid #d8e6ea;
  color: #45636e;
  font-family:
    "SFMono-Regular",
    Consolas,
    "Liberation Mono",
    monospace;
  font-size: 8px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.scanner-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 13px 24px;
  border-top: 1px solid #d5e5e9;
  background: #f8fbfc;
}

.scanner-modal-footer > span {
  color: #879ba2;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.modal-close-button {
  padding: 8px 14px;
  border: 1px solid #c6dce3;
  background: #ffffff;
  color: #5a7680;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
}

.modal-close-button:hover {
  border-color: #22b8df;
  color: #1d9fbd;
}

.history-detail-status {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 9px;
}

.history-detail-status > div {
  padding: 13px;
  border: 1px solid #d8e6ea;
  background: #fbfdfe;
}

.history-detail-status strong {
  display: block;
  color: #304f5a;
  font-size: 11px;
}

.history-summary-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));
  gap: 9px;
  margin-top: 9px;
}

.history-summary-card {
  padding: 14px;
  border: 1px solid #d8e6ea;
  background: #fbfdfe;
}

.history-summary-card span {
  display: block;
  color: #81969e;
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.history-summary-card strong {
  display: block;
  margin-top: 7px;
  color: #17313d;
  font-size: 23px;
}

.history-severity-grid {
  margin-top: 9px;
}

.history-tool-list {
  display: grid;
  gap: 7px;
  margin-top: 9px;
}

.history-tool-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 13px;
  border: 1px solid #d8e6ea;
  background: #fbfdfe;
}

.history-tool-card > div {
  display: grid;
  gap: 3px;
}

.history-tool-card > div strong {
  color: #304f5a;
  font-size: 10px;
}

.history-tool-card > div span {
  color: #81969e;
  font-size: 7px;
  letter-spacing: 0.08em;
}

.history-tool-card > strong {
  color: #22a4c9;
  font-size: 17px;
}

.history-error-section pre {
  margin: 0;
  padding: 12px;
  border: 1px solid #e8d2ce;
  background: #fff9f7;
  color: #9c6259;
  font-family:
    "SFMono-Regular",
    Consolas,
    "Liberation Mono",
    monospace;
  font-size: 8px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.history-modal-loading {
  display: grid;
  place-items: center;
  gap: 10px;
  min-height: 300px;
  padding: 24px;
  color: #627c86;
  text-align: center;
}

.history-modal-loading strong {
  color: #304f5a;
  font-size: 11px;
}

.history-modal-loading span {
  color: #8ca0a8;
  font-size: 8px;
  letter-spacing: 0.12em;
}

.loading-spinner {
  width: 25px;
  height: 25px;
  border: 2px solid #d7e6ea;
  border-top-color: #22b8df;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.scanner-modal-enter-active,
.scanner-modal-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.scanner-modal-enter-from,
.scanner-modal-leave-to {
  opacity: 0;
}

.scanner-modal-enter-from
.scanner-modal,
.scanner-modal-leave-to
.scanner-modal {
  transform:
    translateY(14px)
    scale(0.985);
}

.floating-error-enter-active,
.floating-error-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.floating-error-enter-from,
.floating-error-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.page-enter {
  animation:
    page-enter
    0.5s
    cubic-bezier(0.16, 1, 0.3, 1)
    both;
}

.delay-1 {
  animation-delay: 0.04s;
}

.delay-2 {
  animation-delay: 0.08s;
}

.delay-3 {
  animation-delay: 0.12s;
}

.delay-4 {
  animation-delay: 0.16s;
}

.delay-5 {
  animation-delay: 0.2s;
}

@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes grid-drift {
  from {
    background-position: 0 0, 0 0;
  }

  to {
    background-position: 48px 48px, 48px 48px;
  }
}

@keyframes ambient-scan {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(760%);
  }
}

@keyframes banner-scan {
  from {
    left: -20%;
  }

  to {
    left: 110%;
  }
}

@keyframes card-scan {
  from {
    transform: translateX(-120%);
  }

  to {
    transform: translateX(520%);
  }
}

@keyframes finding-scan {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(650%);
  }
}

@keyframes progress-flow {
  from {
    transform: translateX(-120%);
  }

  to {
    transform: translateX(550%);
  }
}

@keyframes modal-scan-line {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(100%);
  }
}

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.45;
    transform: scale(0.78);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .admin-scanner {
    padding: 24px 18px 40px;
  }

  .monitor-grid {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .history-row {
    grid-template-columns:
      52px minmax(0, 1fr) auto;
  }

  .history-duration {
    display: none;
  }
}

@media (max-width: 780px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .refresh-button {
    width: 100%;
  }

  .status-banner {
    align-items: flex-start;
    flex-direction: column;
  }

  .last-check {
    width: 100%;
    padding-top: 10px;
    border-top: 1px solid #dce8ec;
    text-align: left;
  }

  .metrics-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .scan-control-content {
    align-items: stretch;
    flex-direction: column;
  }

  .run-scan-button {
    width: 100%;
  }

  .pipeline {
    flex-direction: column;
  }

  .pipeline-item {
    width: 100%;
  }

  .pipeline-line {
    display: none;
  }

  .filter-row {
    align-items: stretch;
    flex-direction: column;
  }

  .search-box {
    min-width: 0;
    width: 100%;
  }

  .finding-row {
    grid-template-columns:
      25px minmax(0, 1fr) auto;
  }

  .finding-arrow {
    font-size: 15px;
  }

  .modal-grid,
  .history-detail-status,
  .history-summary-grid,
  .history-severity-grid {
    grid-template-columns: 1fr;
  }

  .scanner-modal-backdrop {
    align-items: flex-end;
    padding: 12px;
  }

  .scanner-modal {
    max-height: calc(100vh - 24px);
  }

  .scanner-modal-body {
    max-height: calc(100vh - 165px);
  }

  .scanner-modal-header,
  .scanner-modal-footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .scanner-modal-body {
    padding: 18px 16px;
  }

  .history-title-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .findings-header {
    gap: 12px;
  }

  .findings-header-actions {
    margin-left: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-grid,
  .ambient-scan,
  .refresh-icon.spinning,
  .status-indicator span,
  .panel-live span,
  .card-scan,
  .metric-scan,
  .finding-scan,
  .history-scan-line,
  .scan-progress-bar.active span,
  .loading-spinner,
  .run-scan-icon.active,
  .scanner-modal::before,
  .status-banner::after,
  .findings-toggle-icon {
    animation: none;
  }

  .page-enter {
    animation: none;
  }

  .findings-collapse-enter-active,
  .findings-collapse-leave-active {
    transition: none;
  }
}
</style>