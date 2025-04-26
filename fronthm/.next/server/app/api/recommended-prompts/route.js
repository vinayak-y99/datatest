/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/recommended-prompts/route";
exports.ids = ["app/api/recommended-prompts/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Frecommended-prompts%2Froute&page=%2Fapi%2Frecommended-prompts%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Frecommended-prompts%2Froute.js&appDir=D%3A%5Cprojects%5CCompleteHM%5CcompleteHM%5Cfronthm%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Cprojects%5CCompleteHM%5CcompleteHM%5Cfronthm&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Frecommended-prompts%2Froute&page=%2Fapi%2Frecommended-prompts%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Frecommended-prompts%2Froute.js&appDir=D%3A%5Cprojects%5CCompleteHM%5CcompleteHM%5Cfronthm%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Cprojects%5CCompleteHM%5CcompleteHM%5Cfronthm&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_projects_CompleteHM_completeHM_fronthm_src_app_api_recommended_prompts_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/recommended-prompts/route.js */ \"(rsc)/./src/app/api/recommended-prompts/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/recommended-prompts/route\",\n        pathname: \"/api/recommended-prompts\",\n        filename: \"route\",\n        bundlePath: \"app/api/recommended-prompts/route\"\n    },\n    resolvedPagePath: \"D:\\\\projects\\\\CompleteHM\\\\completeHM\\\\fronthm\\\\src\\\\app\\\\api\\\\recommended-prompts\\\\route.js\",\n    nextConfigOutput,\n    userland: D_projects_CompleteHM_completeHM_fronthm_src_app_api_recommended_prompts_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZyZWNvbW1lbmRlZC1wcm9tcHRzJTJGcm91dGUmcGFnZT0lMkZhcGklMkZyZWNvbW1lbmRlZC1wcm9tcHRzJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGcmVjb21tZW5kZWQtcHJvbXB0cyUyRnJvdXRlLmpzJmFwcERpcj1EJTNBJTVDcHJvamVjdHMlNUNDb21wbGV0ZUhNJTVDY29tcGxldGVITSU1Q2Zyb250aG0lNUNzcmMlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUQlM0ElNUNwcm9qZWN0cyU1Q0NvbXBsZXRlSE0lNUNjb21wbGV0ZUhNJTVDZnJvbnRobSZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDMkM7QUFDeEg7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkQ6XFxcXHByb2plY3RzXFxcXENvbXBsZXRlSE1cXFxcY29tcGxldGVITVxcXFxmcm9udGhtXFxcXHNyY1xcXFxhcHBcXFxcYXBpXFxcXHJlY29tbWVuZGVkLXByb21wdHNcXFxccm91dGUuanNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3JlY29tbWVuZGVkLXByb21wdHMvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9yZWNvbW1lbmRlZC1wcm9tcHRzXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9yZWNvbW1lbmRlZC1wcm9tcHRzL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiRDpcXFxccHJvamVjdHNcXFxcQ29tcGxldGVITVxcXFxjb21wbGV0ZUhNXFxcXGZyb250aG1cXFxcc3JjXFxcXGFwcFxcXFxhcGlcXFxccmVjb21tZW5kZWQtcHJvbXB0c1xcXFxyb3V0ZS5qc1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Frecommended-prompts%2Froute&page=%2Fapi%2Frecommended-prompts%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Frecommended-prompts%2Froute.js&appDir=D%3A%5Cprojects%5CCompleteHM%5CcompleteHM%5Cfronthm%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Cprojects%5CCompleteHM%5CcompleteHM%5Cfronthm&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./src/app/api/recommended-prompts/route.js":
/*!**************************************************!*\
  !*** ./src/app/api/recommended-prompts/route.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n\n// API base URL\nconst API_BASE_URL = 'http://127.0.0.1:8000';\n// Handler for POST requests to /api/recommended-prompts\nasync function POST(request) {\n    try {\n        const requestData = await request.json();\n        // Forward the request to the backend API\n        const response = await fetch(`${API_BASE_URL}/api/recommended-prompts`, {\n            method: 'POST',\n            headers: {\n                'Content-Type': 'application/json'\n            },\n            body: JSON.stringify(requestData)\n        });\n        // Check if the request was successful\n        if (!response.ok) {\n            const errorText = await response.text();\n            console.error(`Error from backend API: ${errorText}`);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: `Error from backend API: ${response.status} ${response.statusText}`\n            }, {\n                status: response.status\n            });\n        }\n        // Parse and return the response\n        const data = await response.json();\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json(data);\n    } catch (error) {\n        console.error('Error proxying API request:', error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: `Server error: ${error.message}`\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9yZWNvbW1lbmRlZC1wcm9tcHRzL3JvdXRlLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQTJDO0FBRTNDLGVBQWU7QUFDZixNQUFNQyxlQUFlO0FBRXJCLHdEQUF3RDtBQUNqRCxlQUFlQyxLQUFLQyxPQUFPO0lBQ2hDLElBQUk7UUFDRixNQUFNQyxjQUFjLE1BQU1ELFFBQVFFLElBQUk7UUFFdEMseUNBQXlDO1FBQ3pDLE1BQU1DLFdBQVcsTUFBTUMsTUFBTSxHQUFHTixhQUFhLHdCQUF3QixDQUFDLEVBQUU7WUFDdEVPLFFBQVE7WUFDUkMsU0FBUztnQkFDUCxnQkFBZ0I7WUFDbEI7WUFDQUMsTUFBTUMsS0FBS0MsU0FBUyxDQUFDUjtRQUN2QjtRQUVBLHNDQUFzQztRQUN0QyxJQUFJLENBQUNFLFNBQVNPLEVBQUUsRUFBRTtZQUNoQixNQUFNQyxZQUFZLE1BQU1SLFNBQVNTLElBQUk7WUFDckNDLFFBQVFDLEtBQUssQ0FBQyxDQUFDLHdCQUF3QixFQUFFSCxXQUFXO1lBQ3BELE9BQU9kLHFEQUFZQSxDQUFDSyxJQUFJLENBQ3RCO2dCQUFFWSxPQUFPLENBQUMsd0JBQXdCLEVBQUVYLFNBQVNZLE1BQU0sQ0FBQyxDQUFDLEVBQUVaLFNBQVNhLFVBQVUsRUFBRTtZQUFDLEdBQzdFO2dCQUFFRCxRQUFRWixTQUFTWSxNQUFNO1lBQUM7UUFFOUI7UUFFQSxnQ0FBZ0M7UUFDaEMsTUFBTUUsT0FBTyxNQUFNZCxTQUFTRCxJQUFJO1FBQ2hDLE9BQU9MLHFEQUFZQSxDQUFDSyxJQUFJLENBQUNlO0lBQzNCLEVBQUUsT0FBT0gsT0FBTztRQUNkRCxRQUFRQyxLQUFLLENBQUMsK0JBQStCQTtRQUM3QyxPQUFPakIscURBQVlBLENBQUNLLElBQUksQ0FDdEI7WUFBRVksT0FBTyxDQUFDLGNBQWMsRUFBRUEsTUFBTUksT0FBTyxFQUFFO1FBQUMsR0FDMUM7WUFBRUgsUUFBUTtRQUFJO0lBRWxCO0FBQ0YiLCJzb3VyY2VzIjpbIkQ6XFxwcm9qZWN0c1xcQ29tcGxldGVITVxcY29tcGxldGVITVxcZnJvbnRobVxcc3JjXFxhcHBcXGFwaVxccmVjb21tZW5kZWQtcHJvbXB0c1xccm91dGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xyXG5cclxuLy8gQVBJIGJhc2UgVVJMXHJcbmNvbnN0IEFQSV9CQVNFX1VSTCA9ICdodHRwOi8vMTI3LjAuMC4xOjgwMDAnO1xyXG5cclxuLy8gSGFuZGxlciBmb3IgUE9TVCByZXF1ZXN0cyB0byAvYXBpL3JlY29tbWVuZGVkLXByb21wdHNcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxdWVzdCkge1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXF1ZXN0RGF0YSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xyXG4gICAgXHJcbiAgICAvLyBGb3J3YXJkIHRoZSByZXF1ZXN0IHRvIHRoZSBiYWNrZW5kIEFQSVxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtBUElfQkFTRV9VUkx9L2FwaS9yZWNvbW1lbmRlZC1wcm9tcHRzYCwge1xyXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgIH0sXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHJlcXVlc3REYXRhKSxcclxuICAgIH0pO1xyXG4gICAgXHJcbiAgICAvLyBDaGVjayBpZiB0aGUgcmVxdWVzdCB3YXMgc3VjY2Vzc2Z1bFxyXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGZyb20gYmFja2VuZCBBUEk6ICR7ZXJyb3JUZXh0fWApO1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgICAgeyBlcnJvcjogYEVycm9yIGZyb20gYmFja2VuZCBBUEk6ICR7cmVzcG9uc2Uuc3RhdHVzfSAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCB9LFxyXG4gICAgICAgIHsgc3RhdHVzOiByZXNwb25zZS5zdGF0dXMgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBQYXJzZSBhbmQgcmV0dXJuIHRoZSByZXNwb25zZVxyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihkYXRhKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgcHJveHlpbmcgQVBJIHJlcXVlc3Q6JywgZXJyb3IpO1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxyXG4gICAgICB7IGVycm9yOiBgU2VydmVyIGVycm9yOiAke2Vycm9yLm1lc3NhZ2V9YCB9LFxyXG4gICAgICB7IHN0YXR1czogNTAwIH1cclxuICAgICk7XHJcbiAgfVxyXG59ICJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJBUElfQkFTRV9VUkwiLCJQT1NUIiwicmVxdWVzdCIsInJlcXVlc3REYXRhIiwianNvbiIsInJlc3BvbnNlIiwiZmV0Y2giLCJtZXRob2QiLCJoZWFkZXJzIiwiYm9keSIsIkpTT04iLCJzdHJpbmdpZnkiLCJvayIsImVycm9yVGV4dCIsInRleHQiLCJjb25zb2xlIiwiZXJyb3IiLCJzdGF0dXMiLCJzdGF0dXNUZXh0IiwiZGF0YSIsIm1lc3NhZ2UiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/recommended-prompts/route.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Frecommended-prompts%2Froute&page=%2Fapi%2Frecommended-prompts%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Frecommended-prompts%2Froute.js&appDir=D%3A%5Cprojects%5CCompleteHM%5CcompleteHM%5Cfronthm%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5Cprojects%5CCompleteHM%5CcompleteHM%5Cfronthm&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();