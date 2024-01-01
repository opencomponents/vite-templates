port module Main exposing (..)

import Browser
import Css exposing (..)
import Html.Styled exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Json.Decode as D
import Json.Encode as E



-- MAIN


main : Program E.Value Model Msg
main =
    Browser.element
        { init = init
        , view = view >> toUnstyled
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Model =
    { staticPath: String, firstName : String, lastName : String, born : Int, hobbies : List String, funFact: Maybe String }

type alias FactModel =
    { funFact: String }


type alias DataRequest =
    { year : Int }


encode : DataRequest -> E.Value
encode data =
    E.object
        [ ( "year", E.int data.year )
        ]


init : E.Value -> ( Model, Cmd Msg )
init flags =
    ( case D.decodeValue decoder flags of
        Ok model ->
            model

        Err _ ->
            { staticPath = "", firstName = "", lastName = "", born = 0, hobbies = [], funFact = Nothing }
    , Cmd.none
    )


isJust : Maybe a -> Bool
isJust data =
    case data of
        Nothing ->
            False

        _ ->
            True



-- UPDATE


type Msg
    = GetFunFact
    | Recv E.Value


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GetFunFact ->
            ( model, DataRequest model.born |> encode |> askFunFact )

        Recv data ->
            ( case D.decodeValue factDecoder data of
                Ok newModel ->
                    { model | funFact = Just newModel }

                Err _ ->
                    { staticPath = "", firstName = "", lastName = "", born = 0, hobbies = [], funFact = Nothing }
            , Cmd.none
            )

-- VIEW

view : Model -> Html Msg
view model =
    div [ css 
            [ backgroundColor (hex "3b246c")
            , color (hex "fff")
            , fontFamilies [ "sans-serif" ]
            , padding (px 40)
            ]
        ]
        [ img [ Html.Styled.Attributes.width 50, Html.Styled.Attributes.height 50, src (model.staticPath ++ "public/logo.png"), alt "Logo" ] []
        , h1 [ css [ margin4 (px 0) (px 0) (px 20) (px 0) ] ]
            [ text ("Hello, ") 
            , span [ css [ textDecoration underline ] ] [text (model.firstName)]
            , text( " " ++ model.lastName ) ]
        , div [ css [ marginBottom (px 20) ] ]
            [ div [ css [ margin2 (px 6) (px 0) ] ] [ text ("Born: " ++ String.fromInt model.born) ]
            , div [ css [ margin2 (px 6) (px 0) ] ] [ text ("Hobbies: " ++ String.join ", " (List.map String.toLower model.hobbies)) ]
            ]
        , case model.funFact of
            Nothing ->
                text ""

            Just fact ->
                div [] [text (fact)]
        , button [ css 
                      [ backgroundColor (hex "a97613")
                      , border (px 0)
                      , padding2 (px 15) (px 32)
                      , textAlign center
                      , fontSize (px 16)
                      , textDecoration none
                      , display inlineBlock
                      , color inherit
                      , cursor pointer
                      ]
                  , onClick GetFunFact
                  ]
                  [ text "Fun year fact" ]
                      
        ]


-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    getFunFact Recv


decoder : D.Decoder Model
decoder =
    D.map6 Model
        (D.field "staticPath" D.string)
        (D.field "firstName" D.string)
        (D.field "lastName" D.string)
        (D.field "born" D.int)
        (D.field "hobbies" (D.list D.string))
        (D.maybe (D.field "funFact" D.string))

-- decoder of a single string field
factDecoder : D.Decoder String
factDecoder =
    D.field "funFact" D.string


-- PORTS


port askFunFact : E.Value -> Cmd msg


port getFunFact : (E.Value -> msg) -> Sub msg
