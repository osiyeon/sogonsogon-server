INSERT INTO `sogonsogon`.`region_1` (`no`, `bcode`, `bname`) VALUES ('1', '11', '서울특별시'); 

INSERT INTO `sogonsogon`.`region_2` (`no`, `bcode`, `bname`,`region_1_no`) VALUES ('1', '110', '종로구','1'),('2', '140', '중구','1'),('3', '170', '용산구','1'),('4', '200', '성동구','1'),('5', '215', '광진구','1'); 

INSERT INTO `sogonsogon`.`region_3` (`no`, `bcode`, `bname`,`region_2_no`) VALUES ('1', '101', '청운동','1'),('2', '102', '신교동','1'),('3', '103', '궁정동','1'),('4', '104', '효자동','1'),('5', '105', '창성동','1'); 

INSERT INTO `sogonsogon`.`region_4` (`no`, `bcode`,`region_3_no`) VALUES ('1', '00', '1');