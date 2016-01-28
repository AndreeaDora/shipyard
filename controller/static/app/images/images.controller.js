(function(){
	'use strict';

	angular
		.module('shipyard.images')
		.controller('ImagesController', ImagesController);

	ImagesController.$inject = ['images', 'ImagesService', '$state', '$timeout', '$scope'];
	function ImagesController(images, ImagesService, $state, $timeout, $scope) {
            var vm = this;
            vm.images = null;
            vm.pulling = false;
            vm.selectedImage = null;
            vm.refresh = refresh;
            vm.removeImage = removeImage;
            vm.pullImage = pullImage;
            vm.pullImageName = "";
            vm.showRemoveImageDialog = showRemoveImageDialog;
            vm.showPullImageDialog = showPullImageDialog;
            vm.error = "";

            function showRemoveImageDialog(image) {
                vm.selectedImage = image;
                $('#remove-modal').modal('show');
            }

            function showPullImageDialog(image) {
                $('#pull-modal').modal('show');
            }

            refresh();

            function refresh() {
                ImagesService.list()
                    .then(function(data) {
                        vm.images = data; 
                        angular.forEach(vm.images, function(i) {
                           var date = new Date(i.Created*1000);
                           var year = date.getFullYear();
                           var month = date.getMonth() + 1;
                           if(month < 10){
                           	month = "0" + month;
                           }
                           var day= date.getDate();
                           if(day < 10){
                           	day = "0" + day;
                           }
                           var hour = date.getHours();
                           if(hour < 10){
                           	hour = "0" + hour;
                           }
                           var min = date.getMinutes();
                           if(min < 10){
                           	min = "0" + min;
                           }
                           var sec = date.getSeconds();
                           if(sec < 10){
                           	sec = "0" + sec;
                           }
                           var newtimestamp = year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
                           i.Created = newtimestamp;
                        });
                    }, function(data) {
                        vm.error = data;
                    });
                    vm.error = "";
            }

            function removeImage() {
                ImagesService.remove(vm.selectedImage)
                    .then(function(data) {
                        vm.error = "";
                        vm.refresh();
                    }, function(data) {
                        vm.error = data.status + ": " + data.data;
                    });
            }

            function pullImage() {
                vm.error = "";
                vm.pulling = true;
                // this is to prevent errors in the console since we
                // get a stream like response back
                oboe({
                    url: '/images/create?fromImage=' + vm.pullImageName,
                    method: "POST",
                    withCredentials: true,
                    headers: {
                        'X-Access-Token': localStorage.getItem("X-Access-Token")
                    }
                })
                .done(function(node) {
                    // We expect two nodes, e.g.
                    // 1) Pulling busybox...
                    // 2) Pulling busybox... : downloaded
                    if(node.status && node.status.indexOf(":") > -1) {
                        if(node.status.indexOf("downloaded") == -1) {
                            $scope.$apply();
                        } else {
                            setTimeout(vm.refresh, 1000);
                        }
                    }
                    vm.pullImageName = "";
                    vm.pulling = false;
                })
                .fail(function(err) {
                    console.log(err);
                    vm.pulling = false;
                    vm.pullImageName = "";
                    vm.error = err;
                });
            }
	}
})();
