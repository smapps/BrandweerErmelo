/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

    function onDeviceReady()
	{
		//document.addEventListener('deviceready', getReady, false);
		//return navigator.geolocation.getCurrentPosition();
		init('off',0,0);
		//keepscreenon.enable();
	}	
   
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    function getReady(){
      if(typeof navigator.device == "undefined")
	  {
		   document.addEventListener('deviceready', onDeviceReady, false);

	  }
	  else
	  {
		init('off',0,0);
		//keepscreenon.enable();
	  }
	}
