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
    { userId : Int, name : String, email : String, age : Maybe Int }


type alias DataRequest =
    { userId : Int }


encode : DataRequest -> E.Value
encode data =
    E.object
        [ ( "userId", E.int data.userId )
        , ( "moreData", E.bool True )
        ]


init : E.Value -> ( Model, Cmd Msg )
init flags =
    ( case D.decodeValue decoder flags of
        Ok model ->
            model

        Err _ ->
            { name = "", email = "", userId = 0, age = Nothing }
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
    = GetData
    | Recv E.Value


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GetData ->
            ( model, DataRequest model.userId |> encode |> getData )

        Recv data ->
            ( case D.decodeValue decoder data of
                Ok newModel ->
                    newModel

                Err _ ->
                    { name = "", email = "", userId = 0, age = Nothing }
            , Cmd.none
            )



-- VIEW


inputStyle : Style
inputStyle =
    Css.batch
        [ border3 (px 5) solid (rgb 255 240 255)
        , boxShadow5 inset zero zero (px 8) (rgba 0 0 0 0.1)
        , padding (px 15)
        , backgroundColor (rgba 255 255 255 0.5)
        , margin (px 10)
        ]


htmlIf : Html msg -> Bool -> Html msg
htmlIf el cond =
    if cond then
        el

    else
        text ""


view : Model -> Html Msg
view model =
    div
        [ css
            [ padding (px 20)
            ]
        ]
        [ input
            [ css [ inputStyle ]
            , type_ "text"
            , placeholder "Name"
            , value model.name
            ]
            []
        , input
            [ css [ inputStyle ]
            , type_ "text"
            , placeholder "Email"
            , value model.email
            ]
            []
        , case model.age of
            Nothing ->
                text ""

            Just age ->
                input
                    [ css [ inputStyle ]
                    , type_ "number"
                    , placeholder "Age"
                    , String.fromInt age |> value
                    ]
                    []
        , button [ onClick GetData ] [ text "Get more data" ]
        ]



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions _ =
    dataReceiver Recv


decoder : D.Decoder Model
decoder =
    D.map4 Model
        (D.field "userId" D.int)
        (D.field "name" D.string)
        (D.field "email" D.string)
        (D.maybe (D.field "age" D.int))



-- PORTS


port getData : E.Value -> Cmd msg


port dataReceiver : (E.Value -> msg) -> Sub msg
