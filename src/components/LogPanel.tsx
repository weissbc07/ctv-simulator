import React from 'react';
import { format } from 'date-fns';
import { 
  Filter, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  Eye,
  Copy
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { parseVASTResponse } from '../utils/adRequests';

const LogPanel: React.FC = () => {
  const {
    logs,
    adRequests,
    logFilter,
    setLogFilter,
    clearLogs,
    clearAdRequests,
    selectedAdRequest,
    setSelectedAdRequest
  } = useStore();

  const filteredLogs = logs.filter(log => 
    logFilter === 'all' || log.level === logFilter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return React.createElement(CheckCircle, { className: "w-4 h-4 text-ctv-green" });
      case 'error':
        return React.createElement(XCircle, { className: "w-4 h-4 text-ctv-red" });
      case 'pending':
        return React.createElement(Clock, { className: "w-4 h-4 text-ctv-yellow animate-spin" });
      case 'timeout':
        return React.createElement(AlertTriangle, { className: "w-4 h-4 text-ctv-yellow" });
      default:
        return React.createElement(Info, { className: "w-4 h-4 text-ctv-blue" });
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return React.createElement(CheckCircle, { className: "w-4 h-4 text-ctv-green" });
      case 'error':
        return React.createElement(XCircle, { className: "w-4 h-4 text-ctv-red" });
      case 'warning':
        return React.createElement(AlertTriangle, { className: "w-4 h-4 text-ctv-yellow" });
      default:
        return React.createElement(Info, { className: "w-4 h-4 text-ctv-blue" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatResponseData = (data: any, isVast: boolean = false) => {
    if (!data) return 'No response data';
    
    if (isVast && typeof data === 'string') {
      const vastInfo = parseVASTResponse(data);
      return `VAST Response: ${vastInfo.adCount} ads, ${vastInfo.creativeCount} creatives, ${vastInfo.mediaFileCount} media files`;
    }
    
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    
    return String(data);
  };

  return React.createElement('div', { className: "bg-ctv-gray rounded-lg p-4 h-full flex flex-col" },
    // Header
    React.createElement('div', { className: "flex items-center justify-between mb-4" },
      React.createElement('h2', { className: "text-lg font-semibold" }, "Network & Logs"),
      React.createElement('div', { className: "flex items-center gap-2" },
        React.createElement('select', {
          value: logFilter,
          onChange: (e: any) => setLogFilter(e.target.value),
          className: "bg-ctv-dark border border-gray-600 rounded-md px-3 py-1 text-sm"
        },
          React.createElement('option', { value: "all" }, "All Logs"),
          React.createElement('option', { value: "info" }, "Info"),
          React.createElement('option', { value: "success" }, "Success"),
          React.createElement('option', { value: "warning" }, "Warning"),
          React.createElement('option', { value: "error" }, "Error")
        ),
        React.createElement('button', {
          onClick: clearLogs,
          className: "p-2 text-gray-400 hover:text-white hover:bg-ctv-dark rounded-md",
          title: "Clear Logs"
        }, React.createElement(Trash2, { className: "w-4 h-4" }))
      )
    ),
    
    // Ad Requests Section
    React.createElement('div', { className: "mb-6" },
      React.createElement('div', { className: "flex items-center justify-between mb-3" },
        React.createElement('h3', { className: "text-md font-medium" }, `Ad Requests (${adRequests.length})`),
        React.createElement('button', {
          onClick: clearAdRequests,
          className: "text-xs text-gray-400 hover:text-white"
        }, "Clear All")
      ),
      
      React.createElement('div', { className: "space-y-2 max-h-64 overflow-y-auto" },
        adRequests.length === 0 
          ? React.createElement('div', { className: "text-center text-gray-400 py-8" },
              "No ad requests yet. Start playing the video to trigger ad requests."
            )
          : adRequests.map((request) =>
              React.createElement('div', {
                key: request.id,
                className: `p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedAdRequest === request.id
                    ? 'border-ctv-blue bg-ctv-blue/10'
                    : 'border-gray-600 bg-ctv-dark hover:border-gray-500'
                }`,
                onClick: () => setSelectedAdRequest(
                  selectedAdRequest === request.id ? null : request.id
                )
              },
                React.createElement('div', { className: "flex items-center justify-between mb-2" },
                  React.createElement('div', { className: "flex items-center gap-2" },
                    getStatusIcon(request.status || 'pending'),
                    React.createElement('span', { className: "text-sm font-medium" },
                      `${request.method} ${new URL(request.url).hostname}`
                    )
                  ),
                  React.createElement('div', { className: "flex items-center gap-2 text-xs text-gray-400" },
                    request.responseTime && React.createElement('span', null, `${request.responseTime}ms`),
                    React.createElement('span', null, format(request.timestamp, 'HH:mm:ss'))
                  )
                ),
                
                request.responseStatus && React.createElement('div', { className: "text-xs text-gray-400 mb-2" },
                  `Status: ${request.responseStatus}`
                ),
                
                request.error && React.createElement('div', { className: "text-xs text-ctv-red" },
                  `Error: ${request.error}`
                ),
                
                selectedAdRequest === request.id && React.createElement('div', { className: "mt-3 pt-3 border-t border-gray-600" },
                  React.createElement('div', { className: "space-y-3" },
                    // Request URL
                    React.createElement('div', null,
                      React.createElement('div', { className: "flex items-center justify-between mb-1" },
                        React.createElement('span', { className: "text-xs font-medium text-gray-300" }, "Request URL"),
                        React.createElement('button', {
                          onClick: (e: any) => {
                            e.stopPropagation();
                            copyToClipboard(request.url);
                          },
                          className: "text-gray-400 hover:text-white"
                        }, React.createElement(Copy, { className: "w-3 h-3" }))
                      ),
                      React.createElement('div', { className: "text-xs font-mono bg-black/50 p-2 rounded break-all" },
                        request.url
                      )
                    ),
                    
                    // Headers
                    React.createElement('div', null,
                      React.createElement('span', { className: "text-xs font-medium text-gray-300" }, "Headers"),
                      React.createElement('div', { className: "text-xs font-mono bg-black/50 p-2 rounded mt-1" },
                        Object.entries(request.headers).map(([key, value]) =>
                          React.createElement('div', { key, className: "mb-1" },
                            React.createElement('span', { className: "text-ctv-blue" }, `${key}:`),
                            ` ${value}`
                          )
                        )
                      )
                    ),
                    
                    // Payload
                    request.payload && React.createElement('div', null,
                      React.createElement('span', { className: "text-xs font-medium text-gray-300" }, "Request Payload"),
                      React.createElement('div', { className: "text-xs font-mono bg-black/50 p-2 rounded mt-1 max-h-32 overflow-y-auto" },
                        JSON.stringify(request.payload, null, 2)
                      )
                    ),
                    
                    // Response
                    request.responseData && React.createElement('div', null,
                      React.createElement('span', { className: "text-xs font-medium text-gray-300" }, "Response"),
                      React.createElement('div', { className: "text-xs font-mono bg-black/50 p-2 rounded mt-1 max-h-32 overflow-y-auto" },
                        formatResponseData(
                          request.responseData,
                          request.url.includes('vast') || 
                          (typeof request.responseData === 'string' && request.responseData.includes('<VAST'))
                        )
                      )
                    )
                  )
                )
              )
            )
      )
    ),
    
    // Logs Section
    React.createElement('div', { className: "flex-1 flex flex-col" },
      React.createElement('h3', { className: "text-md font-medium mb-3" }, `Console Logs (${filteredLogs.length})`),
      
      React.createElement('div', { className: "flex-1 overflow-y-auto space-y-2" },
        filteredLogs.length === 0
          ? React.createElement('div', { className: "text-center text-gray-400 py-8" },
              "No logs to display."
            )
          : filteredLogs.map((log) =>
              React.createElement('div', {
                key: log.id,
                className: `log-entry ${log.level} text-sm`
              },
                React.createElement('div', { className: "flex items-start gap-2" },
                  getLogIcon(log.level),
                  React.createElement('div', { className: "flex-1" },
                    React.createElement('div', { className: "flex items-center justify-between" },
                      React.createElement('span', { className: "font-medium" }, log.message),
                      React.createElement('span', { className: "text-xs text-gray-400" },
                        format(log.timestamp, 'HH:mm:ss.SSS')
                      )
                    ),
                    log.details && React.createElement('div', { className: "text-xs font-mono mt-1 text-gray-300" },
                      JSON.stringify(log.details, null, 2)
                    )
                  )
                )
              )
            )
      )
    )
  );
};

export default LogPanel; 