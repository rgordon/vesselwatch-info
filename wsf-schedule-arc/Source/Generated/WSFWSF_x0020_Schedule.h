/*
	WSFWSF_x0020_Schedule.h
	The interface definition of classes and methods for the WSF_x0020_Schedule web service.
	Generated by SudzC.com
*/
				
#import "Soap.h"
	
/* The Washington State Ferries schedule web service provides sailing times pertaining to terminal combinations or routes for a particular date. */
	
/* Add class references */
				
#import "WSFAPIAccessHeader.h"
#import "WSFArrayOfInt.h"
#import "WSFTripDateMsg.h"
#import "WSFRouteAlert.h"
#import "WSFRouteBriefAlert.h"
#import "WSFTerminalResponse.h"
#import "WSFTerminalComboResponse.h"
#import "WSFSchedSailingDateRange.h"
#import "WSFSchedAnnotation.h"
#import "WSFRouteMsg.h"
#import "WSFTerminalComboMsg.h"
#import "WSFSchedMsg.h"
#import "WSFSchedRouteMsg.h"
#import "WSFArrayOfString.h"
#import "WSFTerminalMsg.h"
#import "WSFRouteBriefMsg.h"
#import "WSFRouteTodayMsg.h"
#import "WSFTerminalComboTodayMsg.h"
#import "WSFValidDateRangeResponse.h"
#import "WSFArrayOfSchedBriefResponse.h"
#import "WSFSchedBriefResponse.h"
#import "WSFArrayOfAlertResponse.h"
#import "WSFAlertResponse.h"
#import "WSFArrayOfRouteResponse.h"
#import "WSFRouteResponse.h"
#import "WSFArrayOfRouteAlert.h"
#import "WSFArrayOfRouteBriefResponse.h"
#import "WSFRouteBriefResponse.h"
#import "WSFArrayOfRouteBriefAlert.h"
#import "WSFArrayOfSchedRouteBriefResponse.h"
#import "WSFArrayOfSchedRouteAdj.h"
#import "WSFSchedRouteAdj.h"
#import "WSFArrayOfTerminalResponse.h"
#import "WSFArrayOfTerminalComboResponse.h"
#import "WSFArrayOfSchedTimeAdjResponse.h"
#import "WSFArrayOfSchedAnnotation.h"
#import "WSFArrayOfSchedSailingResponse.h"
#import "WSFArrayOfSchedSailingDateRange.h"
#import "WSFArrayOfSchedJourn.h"
#import "WSFSchedJourn.h"
#import "WSFArrayOfSchedTimeTerminal.h"
#import "WSFArrayOfSchedTerminalCombo.h"
#import "WSFArrayOfSchedTime.h"
#import "WSFSchedRouteBriefResponse.h"
#import "WSFSchedTimeTerminal.h"
#import "WSFSchedTerminalCombo.h"
#import "WSFSchedSailingResponse.h"
#import "WSFSchedResponse.h"
#import "WSFSchedTime.h"
#import "WSFSchedTimeAdjResponse.h"

/* Interface for the service */
				
@interface WSFWSF_x0020_Schedule : SoapService
		
	/* Returns NSMutableArray*. Provides a brief summary of all scheduled sailing seasons that are currently active / available. */
	- (SoapRequest*) GetActiveScheduledSeasons: (id <SoapDelegate>) handler;
	- (SoapRequest*) GetActiveScheduledSeasons: (id) target action: (SEL) action;

	/* Returns NSMutableArray*. Retrieves all published alerts. */
	- (SoapRequest*) GetAllAlerts: (id <SoapDelegate>) handler;
	- (SoapRequest*) GetAllAlerts: (id) target action: (SEL) action;

	/* Returns NSMutableArray*. Provides detailed information for all available routes pertaining to a particular date. */
	- (SoapRequest*) GetAllRouteDetails: (id <SoapDelegate>) handler request: (WSFTripDateMsg*) request;
	- (SoapRequest*) GetAllRouteDetails: (id) target action: (SEL) action request: (WSFTripDateMsg*) request;

	/* Returns NSMutableArray*. Provides all available routes for a particular date. */
	- (SoapRequest*) GetAllRoutes: (id <SoapDelegate>) handler request: (WSFTripDateMsg*) request;
	- (SoapRequest*) GetAllRoutes: (id) target action: (SEL) action request: (WSFTripDateMsg*) request;

	/* Returns NSMutableArray*. Provides all available routes for a particular date where one or more service disruptions are present. */
	- (SoapRequest*) GetAllRoutesHavingServiceDisruptions: (id <SoapDelegate>) handler request: (WSFTripDateMsg*) request;
	- (SoapRequest*) GetAllRoutesHavingServiceDisruptions: (id) target action: (SEL) action request: (WSFTripDateMsg*) request;

	/* Returns NSMutableArray*. Retrieves the scheduled route(s) for all seasons that are currently active / available. */
	- (SoapRequest*) GetAllSchedRoutes: (id <SoapDelegate>) handler;
	- (SoapRequest*) GetAllSchedRoutes: (id) target action: (SEL) action;

	/* Returns NSMutableArray*. Provides all available terminals for a particular date. */
	- (SoapRequest*) GetAllTerminals: (id <SoapDelegate>) handler request: (WSFTripDateMsg*) request;
	- (SoapRequest*) GetAllTerminals: (id) target action: (SEL) action request: (WSFTripDateMsg*) request;

	/* Returns NSMutableArray*. For a given date, retrieves all available terminal combinations. */
	- (SoapRequest*) GetAllTerminalsAndMates: (id <SoapDelegate>) handler request: (WSFTripDateMsg*) request;
	- (SoapRequest*) GetAllTerminalsAndMates: (id) target action: (SEL) action request: (WSFTripDateMsg*) request;

	/* Returns NSMutableArray*. Provides a list of all individual time adjustments (additions or cancellations) that are currently active / available. */
	- (SoapRequest*) GetAllTimeAdj: (id <SoapDelegate>) handler;
	- (SoapRequest*) GetAllTimeAdj: (id) target action: (SEL) action;

	/* Returns NSDate*. Most web methods in this service are cached.  If you are also using caching in your user interface, it may be helpful to know the date and time that the cache was last flushed in this web service. */
	- (SoapRequest*) GetCacheFlushDate: (id <SoapDelegate>) handler;
	- (SoapRequest*) GetCacheFlushDate: (id) target action: (SEL) action;

	/* Returns WSFRouteResponse*. Retrieves detailed information pertaining to a scheduled route. */
	- (SoapRequest*) GetRouteDetail: (id <SoapDelegate>) handler request: (WSFRouteMsg*) request;
	- (SoapRequest*) GetRouteDetail: (id) target action: (SEL) action request: (WSFRouteMsg*) request;

	/* Returns NSMutableArray*. Retrieves detailed information for scheduled routes that are associated with a particular terminal combination. */
	- (SoapRequest*) GetRouteDetailsByTerminalCombo: (id <SoapDelegate>) handler request: (WSFTerminalComboMsg*) request;
	- (SoapRequest*) GetRouteDetailsByTerminalCombo: (id) target action: (SEL) action request: (WSFTerminalComboMsg*) request;

	/* Returns NSMutableArray*. Retrieves route(s) for a particular date and terminal combination. */
	- (SoapRequest*) GetRoutesByTerminalCombo: (id <SoapDelegate>) handler request: (WSFTerminalComboMsg*) request;
	- (SoapRequest*) GetRoutesByTerminalCombo: (id) target action: (SEL) action request: (WSFTerminalComboMsg*) request;

	/* Returns NSMutableArray*. Retrieves scheduled route(s) for a particular active season. */
	- (SoapRequest*) GetSchedRoutesByScheduledSeason: (id <SoapDelegate>) handler request: (WSFSchedMsg*) request;
	- (SoapRequest*) GetSchedRoutesByScheduledSeason: (id) target action: (SEL) action request: (WSFSchedMsg*) request;

	/* Returns NSMutableArray*. Retrieves sailings and departure/arrival times that correspond with a particular scheduled route. */
	- (SoapRequest*) GetSchedSailingsBySchedRoute: (id <SoapDelegate>) handler request: (WSFSchedRouteMsg*) request;
	- (SoapRequest*) GetSchedSailingsBySchedRoute: (id) target action: (SEL) action request: (WSFSchedRouteMsg*) request;

	/* Returns WSFSchedResponse*. Retrieves sailing times associated with a specific route for a particular date. */
	- (SoapRequest*) GetScheduleByRoute: (id <SoapDelegate>) handler request: (WSFRouteMsg*) request;
	- (SoapRequest*) GetScheduleByRoute: (id) target action: (SEL) action request: (WSFRouteMsg*) request;

	/* Returns WSFSchedResponse*. Retrieves sailing times associated with a specific departing / arriving terminal combination for a particular date. */
	- (SoapRequest*) GetScheduleByTerminalCombo: (id <SoapDelegate>) handler request: (WSFTerminalComboMsg*) request;
	- (SoapRequest*) GetScheduleByTerminalCombo: (id) target action: (SEL) action request: (WSFTerminalComboMsg*) request;

	/* Returns NSMutableArray*. Provides all available terminals that correspond to a given terminal for a particular date. */
	- (SoapRequest*) GetTerminalMates: (id <SoapDelegate>) handler request: (WSFTerminalMsg*) request;
	- (SoapRequest*) GetTerminalMates: (id) target action: (SEL) action request: (WSFTerminalMsg*) request;

	/* Returns NSMutableArray*. Provides a list of individual time adjustments (additions or cancellations) for a particular route. */
	- (SoapRequest*) GetTimeAdjByRoute: (id <SoapDelegate>) handler request: (WSFRouteBriefMsg*) request;
	- (SoapRequest*) GetTimeAdjByRoute: (id) target action: (SEL) action request: (WSFRouteBriefMsg*) request;

	/* Returns NSMutableArray*. Provides a list of individual time adjustments (additions or cancellations) for a particular scheduled route. */
	- (SoapRequest*) GetTimeAdjBySchedRoute: (id <SoapDelegate>) handler request: (WSFSchedRouteMsg*) request;
	- (SoapRequest*) GetTimeAdjBySchedRoute: (id) target action: (SEL) action request: (WSFSchedRouteMsg*) request;

	/* Returns WSFSchedResponse*. Retrieves sailing times associated with a specific route for the current date.  User may specify if only the times for the remainder of this sailing date are required. */
	- (SoapRequest*) GetTodaysScheduleByRoute: (id <SoapDelegate>) handler request: (WSFRouteTodayMsg*) request;
	- (SoapRequest*) GetTodaysScheduleByRoute: (id) target action: (SEL) action request: (WSFRouteTodayMsg*) request;

	/* Returns WSFSchedResponse*. Retrieves sailing times associated with a specific departing / arriving terminal combination for the current date.  User may specify if only the times for the remainder of this sailing date are required. */
	- (SoapRequest*) GetTodaysScheduleByTerminalCombo: (id <SoapDelegate>) handler request: (WSFTerminalComboTodayMsg*) request;
	- (SoapRequest*) GetTodaysScheduleByTerminalCombo: (id) target action: (SEL) action request: (WSFTerminalComboTodayMsg*) request;

	/* Returns WSFValidDateRangeResponse*. Reveals a valid date range for retrieving schedule data.  This begins with today's date and extends to the end of the most recently posted schedule. */
	- (SoapRequest*) GetValidDateRange: (id <SoapDelegate>) handler;
	- (SoapRequest*) GetValidDateRange: (id) target action: (SEL) action;

		
	+ (WSFWSF_x0020_Schedule*) service;
	+ (WSFWSF_x0020_Schedule*) serviceWithUsername: (NSString*) username andPassword: (NSString*) password;
@end
	