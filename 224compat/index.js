(function(l,o,g,E,i){"use strict";const{FormText:R}=g.Forms;function B(){return React.createElement(R,null,"Hello, world!")}const{View:w,ScrollView:P}=g.General;function F(e){let t;try{t=new URL(e)}catch{return!1}return t.protocol==="http:"||t.protocol==="https:"}const{Button:c,FlashList:H,FloatingActionButton:k,HelpMessage:M,IconButton:O,Stack:z,Text:G,TextInput:I}=i.findByProps("FloatingActionButton","Button"),{ErrorBoundary:f}=bunny.ui.components;let s=[];const u=i.findByProps("hideActionSheet"),{ActionSheet:p,BottomSheetTitleHeader:y}=i.findByProps("ActionSheet","BottomSheetTitleHeader");function L(e,t,n){o.logger.log(typeof p),o.logger.log(typeof y),o.logger.log(typeof f),u.openLazy(Promise.resolve({default:function(){return React.createElement(f,null,React.createElement(p,null,React.createElement(y,{title:t}),React.createElement(e,n)))}}),"AddonPageActionSheet")}function v(e){let{label:t,fetchFn:n}=e;const[r,h]=React.useState(""),[d,b]=React.useState(""),[m,S]=React.useState(!1);function A(){S(!0),n(r).then(function(){return u.hideActionSheet()}).catch(function(a){return a instanceof Error?b(a.message):String(a)}).finally(function(){return S(!1)})}return React.createElement(w,{style:{padding:8,gap:12}},React.createElement(I,{autoFocus:!0,isClearable:!0,value:r,onChange:function(a){h(a),d&&b("")},returnKeyType:"done",onSubmitEditing:A,state:d?"error":void 0,errorMessage:d||void 0}),React.createElement(P,{horizontal:!0,showsHorizontalScrollIndicator:!1,style:{gap:8}},React.createElement(c,{size:"sm",variant:"tertiary",text:"Import from clipboard",icon:bunny.api.assets.findAssetId("ClipboardListIcon"),onPress:function(){return bunny.metro.common.clipboard.getString().then(function(a){return h(a)})}})),React.createElement(c,{loading:m,text:"Install",variant:"primary",disabled:!r||!F(r),onPress:A}),React.createElement(c,{disabled:m,text:"Cancel",variant:"secondary",onPress:function(){return u.hideActionSheet()}}))}function T(e,t){L(v,e,{label:e,fetchFn:t})}function x(e,t){let[n,r]=e;return n==="AddonInputAlert"?T(r.props.label,r.props.fetchFn):t.apply(this,[n,r])}var C={onLoad:async function(){const e=bunny.api.debug.socket;(e===void 0||e.readyState===WebSocket.CLOSED)&&await bunny.api.debug.connectToDebugger("10.10.10.177:9090"),i.findByProps("AlertModal","AlertActions");const t=i.findByProps("openAlert","dismissAlert");o.logger.log("hiiiibefore insted"),s.push(window.bunny.api.patcher.instead("openAlert",t,x)),o.logger.log("hello from my ass"),s.push(E.before("log",o.logger,function(n){return bunny.api.debug.socket.send(JSON.stringify({message:n})),n})),bunny.api.debug.socket.send(JSON.stringify({message:"Loaded"})),o.logger.log("Hello world!")},onUnload:function(){for(const e of s)e();o.logger.log("Goodbye, world.")},settings:B};return l.default=C,Object.defineProperty(l,"__esModule",{value:!0}),l})({},vendetta,vendetta.ui.components,vendetta.patcher,vendetta.metro);
